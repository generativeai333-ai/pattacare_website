/**
 * Vercel Serverless Function: /api/leads
 * Handles secure B2B demo requests for PattaCare.
 * Flow: Client -> Vercel (/api/leads) -> Google Sheets + Resend Transactional Email
 */

import crypto from 'node:crypto';

// In-Memory Fallback Rate Limiter (5 requests / 10 mins per IP)
const memoryRateLimit = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

// Periodically clean up expired rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of memoryRateLimit.entries()) {
    if (now > entry.resetTime) {
      memoryRateLimit.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref?.();

/**
 * Sanitizes input string by stripping non-printable control characters
 */
function sanitizeString(val) {
  if (typeof val !== 'string') return '';
  return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/**
 * HTML escape to prevent XSS in email bodies
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Fetch with configurable timeout using AbortController
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Retry helper: executes fn, on error waits delayMs and retries once
 */
async function withRetry(fn, retries = 1, delayMs = 500) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return await fn();
  }
}

/**
 * Check rate limit (Upstash if configured, otherwise in-memory)
 */
async function checkRateLimit(clientIp) {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({ url: upstashUrl, token: upstashToken });
      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX_REQUESTS, '10 m'),
        analytics: false,
        prefix: 'pattacare:leads:ratelimit'
      });
      const result = await ratelimit.limit(clientIp);
      return result.success;
    } catch (err) {
      console.warn('[RateLimit] Upstash execution error; falling back to in-memory limiter.');
    }
  }

  // Fallback In-Memory Rate Limiting
  const now = Date.now();
  const record = memoryRateLimit.get(clientIp);
  if (!record || now > record.resetTime) {
    memoryRateLimit.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count += 1;
  return true;
}

/**
 * Main Serverless Function Handler
 */
export default async function handler(req, res) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  // 1. Method Check & CORS Handling
  if (req.method !== 'POST' && req.method !== 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    console.log(JSON.stringify({ request_id: requestId, status: 405, error_type: 'METHOD_NOT_ALLOWED' }));
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Determine allowed origins
  const origin = req.headers.origin || req.headers.Origin || '';
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  const defaultOrigins = [
    'https://pattacare.com',
    'https://www.pattacare.com',
    'http://localhost:3000',
    'http://localhost:3005',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
  ];
  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map((o) => o.trim().toLowerCase())
    : defaultOrigins;

  const isAllowedOrigin =
    !origin ||
    allowedOrigins.includes('*') ||
    allowedOrigins.includes(origin.toLowerCase());

  if (!isAllowedOrigin) {
    console.log(JSON.stringify({ request_id: requestId, status: 403, error_type: 'CORS_FORBIDDEN' }));
    return res.status(403).json({ error: 'Forbidden origin' });
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // 2. Request Size Validation (~10 KB limit)
  const contentLength = Number.parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > 10240) {
    console.log(JSON.stringify({ request_id: requestId, status: 413, error_type: 'PAYLOAD_TOO_LARGE' }));
    return res.status(413).json({ error: 'Payload too large. Maximum allowed size is 10 KB.' });
  }

  // 3. Rate Limiting Check
  const clientIp =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  const isRateLimitAllowed = await checkRateLimit(clientIp);
  if (!isRateLimitAllowed) {
    console.log(JSON.stringify({ request_id: requestId, status: 429, error_type: 'RATE_LIMIT_EXCEEDED' }));
    return res.status(429).json({ error: 'Too many requests. Please try again after a few minutes.' });
  }

  // Ensure JSON Body is present
  const body = req.body || {};
  if (typeof body !== 'object' || Array.isArray(body)) {
    console.log(JSON.stringify({ request_id: requestId, status: 400, error_type: 'INVALID_JSON_BODY' }));
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // 4. Honeypot Check (Bot Trap)
  const honeypot = body.website || body._hp || '';
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    // Silently drop bot submission with 200 OK
    console.log(JSON.stringify({ request_id: requestId, status: 200, error_type: 'HONEYPOT_TRIGGERED' }));
    return res.status(200).json({ success: true, message: 'Request received' });
  }

  // 5. Reject Unknown Fields
  const allowedKeys = new Set([
    'name',
    'email',
    'phone',
    'organization',
    'department',
    'website',
    '_hp',
    'turnstile_token',
    'cf-turnstile-response'
  ]);

  for (const key of Object.keys(body)) {
    if (!allowedKeys.has(key)) {
      console.log(JSON.stringify({ request_id: requestId, status: 400, error_type: 'UNKNOWN_FIELD_DETECTED' }));
      return res.status(400).json({ error: `Unknown field detected: ${key}` });
    }
  }

  // 6. Cloudflare Turnstile Verification (Optional)
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const turnstileToken = body['cf-turnstile-response'] || body.turnstile_token || '';
    if (!turnstileToken) {
      console.log(JSON.stringify({ request_id: requestId, status: 400, error_type: 'TURNSTILE_TOKEN_MISSING' }));
      return res.status(400).json({ error: 'Bot verification token required' });
    }

    try {
      const turnstileRes = await fetchWithTimeout(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: turnstileSecret,
            response: turnstileToken,
            remoteip: clientIp
          })
        },
        4000
      );
      const turnstileData = await turnstileRes.json();
      if (!turnstileData.success) {
        console.log(JSON.stringify({ request_id: requestId, status: 400, error_type: 'TURNSTILE_VERIFY_FAILED' }));
        return res.status(400).json({ error: 'Bot verification failed. Please refresh and try again.' });
      }
    } catch (err) {
      console.warn('[Turnstile] Verification timeout or error; bypassing to prevent lead loss.');
    }
  }

  // 7. Server-Side Data Validation
  const name = sanitizeString(body.name);
  const email = sanitizeString(body.email).toLowerCase();
  const phone = sanitizeString(body.phone);
  const organization = sanitizeString(body.organization);
  const department = sanitizeString(body.department);

  // Name: required, 2-100 chars
  if (!name || name.length < 2 || name.length > 100) {
    console.log(JSON.stringify({ request_id: requestId, status: 400, error_type: 'VALIDATION_NAME_INVALID' }));
    return res.status(400).json({ error: 'Doctor / Administrator name must be between 2 and 100 characters.' });
  }

  // Email: required, valid format, max 254 chars
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!email || email.length > 254 || !emailRegex.test(email)) {
    console.log(JSON.stringify({ request_id: requestId, status: 400, error_type: 'VALIDATION_EMAIL_INVALID' }));
    return res.status(400).json({ error: 'Please enter a valid official work email address.' });
  }

  // Organization: required, 2-150 chars
  if (!organization || organization.length < 2 || organization.length > 150) {
    console.log(JSON.stringify({ request_id: requestId, status: 400, error_type: 'VALIDATION_ORGANIZATION_INVALID' }));
    return res.status(400).json({ error: 'Hospital / Healthcare Group name must be between 2 and 150 characters.' });
  }

  // Phone: optional, digits/+/space/hyphen/parentheses, 7-20 chars
  if (phone) {
    const phoneRegex = /^[0-9+\s\-()]{7,20}$/;
    if (!phoneRegex.test(phone)) {
      console.log(JSON.stringify({ request_id: requestId, status: 400, error_type: 'VALIDATION_PHONE_INVALID' }));
      return res.status(400).json({ error: 'Phone number format is invalid. Use digits, +, and hyphens.' });
    }
  }

  // Department: optional, max 100 chars
  if (department && department.length > 100) {
    console.log(JSON.stringify({ request_id: requestId, status: 400, error_type: 'VALIDATION_DEPARTMENT_INVALID' }));
    return res.status(400).json({ error: 'Target department must not exceed 100 characters.' });
  }

  // 8. Resilient Dual-Write Pipeline
  const timestamp = new Date().toISOString();
  let sheetsSuccess = false;
  let emailSuccess = false;

  const defaultSheetsWebhookUrl = 'https://script.google.com/macros/s/AKfycbwl3eWZvFt3GRZjy7sCYpMvAf001toGNHXHzM2EAhn_jvUiyeWHJyCf-IQosZC6J-ND3w/exec';
  const sheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || defaultSheetsWebhookUrl;
  const resendApiKey = process.env.RESEND_API_KEY;
  const notificationEmail = process.env.NOTIFICATION_EMAIL || 'hi@pattacare.com';
  const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'PattaCare Platform <onboarding@resend.dev>';

  // Pipeline Step 1: Write to Google Sheets (5s timeout, 1 retry)
  if (sheetsWebhookUrl) {
    try {
      await withRetry(async () => {
        const sheetsPayload = {
          request_id: requestId,
          timestamp,
          name,
          email,
          phone: phone || 'N/A',
          organization,
          department: department || 'General Surgery'
        };

        const sheetRes = await fetchWithTimeout(
          sheetsWebhookUrl,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sheetsPayload)
          },
          5000
        );

        if (!sheetRes.ok) {
          throw new Error(`Sheets response code: ${sheetRes.status}`);
        }
      }, 1, 500);

      sheetsSuccess = true;
    } catch (err) {
      console.log(JSON.stringify({ request_id: requestId, status: 500, error_type: 'SHEETS_WRITE_FAILED' }));
    }
  } else {
    // If webhook URL is unconfigured, mark as skipped so unconfigured environments don't hard fail
    sheetsSuccess = false;
  }

  // Pipeline Step 2: Send Email via Resend API (5s timeout, 1 retry)
  if (resendApiKey) {
    try {
      await withRetry(async () => {
        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background: #FFFFFF;">
            <div style="border-bottom: 2px solid #145B6B; padding-bottom: 16px; margin-bottom: 20px;">
              <h2 style="color: #0C3B47; margin: 0 0 6px 0; font-size: 20px;">New Hospital Demonstration Request</h2>
              <p style="color: #64748B; margin: 0; font-size: 14px;">PattaCare Inbound B2B Lead Notification</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
              <tr>
                <td style="padding: 10px 0; color: #64748B; width: 140px; font-weight: 600;">Doctor / Admin:</td>
                <td style="padding: 10px 0; color: #0F172A; font-weight: 700;">${escapeHtml(name)}</td>
              </tr>
              <tr style="border-top: 1px solid #F1F5F9;">
                <td style="padding: 10px 0; color: #64748B; font-weight: 600;">Work Email:</td>
                <td style="padding: 10px 0; color: #0F172A;"><a href="mailto:${escapeHtml(email)}" style="color: #145B6B; font-weight: 600;">${escapeHtml(email)}</a></td>
              </tr>
              <tr style="border-top: 1px solid #F1F5F9;">
                <td style="padding: 10px 0; color: #64748B; font-weight: 600;">Hospital Group:</td>
                <td style="padding: 10px 0; color: #0F172A; font-weight: 600;">${escapeHtml(organization)}</td>
              </tr>
              <tr style="border-top: 1px solid #F1F5F9;">
                <td style="padding: 10px 0; color: #64748B; font-weight: 600;">Department:</td>
                <td style="padding: 10px 0; color: #0F172A;">${escapeHtml(department || 'General Surgery')}</td>
              </tr>
              <tr style="border-top: 1px solid #F1F5F9;">
                <td style="padding: 10px 0; color: #64748B; font-weight: 600;">Mobile / WhatsApp:</td>
                <td style="padding: 10px 0; color: #0F172A;">${escapeHtml(phone || 'Not provided')}</td>
              </tr>
              <tr style="border-top: 1px solid #F1F5F9;">
                <td style="padding: 10px 0; color: #64748B; font-weight: 600;">Received At:</td>
                <td style="padding: 10px 0; color: #64748B;">${escapeHtml(timestamp)}</td>
              </tr>
              <tr style="border-top: 1px solid #F1F5F9;">
                <td style="padding: 10px 0; color: #64748B; font-weight: 600;">Request ID:</td>
                <td style="padding: 10px 0; color: #94A3B8; font-family: monospace; font-size: 12px;">${escapeHtml(requestId)}</td>
              </tr>
            </table>

            <div style="background: #F0F8FA; border-left: 4px solid #145B6B; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #0C3B47;">
              <strong>SLA Target:</strong> Please respond within 2 business hours to schedule the clinical director walkthrough.
            </div>
          </div>
        `;

        const emailText = `New Hospital Demo Request:\n\nDoctor: ${name}\nEmail: ${email}\nHospital: ${organization}\nDepartment: ${department || 'General Surgery'}\nPhone: ${phone || 'Not provided'}\nTimestamp: ${timestamp}\nRequest ID: ${requestId}`;

        const emailRes = await fetchWithTimeout(
          'https://api.resend.com/emails',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: resendFromEmail,
              to: [notificationEmail],
              reply_to: email,
              subject: `[Hospital Demo Request] ${organization} - ${name}`,
              html: emailHtml,
              text: emailText
            })
          },
          5000
        );

        if (!emailRes.ok) {
          throw new Error(`Resend API response code: ${emailRes.status}`);
        }
      }, 1, 500);

      emailSuccess = true;
    } catch (err) {
      console.log(JSON.stringify({ request_id: requestId, status: 500, error_type: 'EMAIL_SEND_FAILED' }));
    }
  } else {
    // If API key is unconfigured, mark as skipped
    emailSuccess = false;
  }

  // 9. Dual-Write Outcome Evaluation
  const durationMs = Date.now() - startTime;

  // Case A: Either or both succeeded
  if (sheetsSuccess || emailSuccess) {
    console.log(
      JSON.stringify({
        request_id: requestId,
        status: 200,
        sheets_synced: sheetsSuccess,
        email_dispatched: emailSuccess,
        duration_ms: durationMs
      })
    );
    return res.status(200).json({
      success: true,
      message: 'Demonstration request received successfully.',
      request_id: requestId
    });
  }

  // Case B: If neither destination is configured in environment variables (mock/dev mode)
  if (!sheetsWebhookUrl && !resendApiKey) {
    console.log(
      JSON.stringify({
        request_id: requestId,
        status: 200,
        warning: 'MOCK_MODE_NO_SERVICES_CONFIGURED',
        duration_ms: durationMs
      })
    );
    return res.status(200).json({
      success: true,
      message: 'Demonstration request received (Mock development mode: services not yet configured).',
      request_id: requestId
    });
  }

  // Case C: Both destinations were configured but BOTH failed
  console.log(
    JSON.stringify({
      request_id: requestId,
      status: 502,
      error_type: 'DUAL_WRITE_FAILED',
      duration_ms: durationMs
    })
  );
  return res.status(502).json({
    error: 'Service temporarily unavailable. Please connect directly via WhatsApp or email hi@pattacare.com.',
    request_id: requestId
  });
}
