# Lead Capture System: Read-Only Inspection Report

**Project:** PattaCare B2B Lead Capture Flow  
**Target Platform:** Vercel Serverless Functions (`/api/leads`)  
**Timestamp:** 2026-11-16  
**Auditor:** Antigravity Engineering (GSD & Ponytail Methodology)

---

## 1. Repository & Project Architecture

### 1.1 Folder Layout
```
d:\codebase\pattacare_website/
├── assets/                  # High-performance AVIF/WebP/PNG branding & graphics
├── css/
│   └── styles.css          # Design system, CSS variables & typography tokens
├── docs/
│   ├── lead-capture-inspection.md   # This inspection document
│   └── seo-claims-to-verify.md
├── js/
│   └── main.js             # Client-side UI interactions, telemetry demos, FAQ accordion
├── privacy/
│   └── index.html          # Privacy policy page
├── terms/
│   └── index.html          # Terms of service page
├── web/
│   └── public/             # Next.js / Static public asset directory
│       └── llm.txt         # AI System Scraper Reference
├── index.html              # Main landing page
├── llm.txt                 # Canonical AI system reference
├── robots.txt              # Search & AI crawler directives
└── sitemap.xml             # Search engine XML sitemap
```

### 1.2 Module System & Package Configuration
- **Root `package.json`:** Currently **absent** in root. The site runs as a high-performance static web application served via static host/CDN.
- **Client Scripting:** `js/main.js` is loaded via standard script tag (`<script src="js/main.js" defer></script>`). No bundler (Webpack/Vite) is used; plain vanilla ES6+ is executed in the browser.
- **Serverless Runtime on Vercel:**
  - Vercel automatically deploys functions located in the `/api` directory as Node.js serverless functions.
  - Initializing a minimal root `package.json` with `"type": "module"` enables modern ESM (`import`/`export`) and allows Vercel to install production dependencies (`@upstash/ratelimit`, `@upstash/redis`).

---

## 2. Existing Form Inspection (`index.html`)

### 2.1 Form Location & DOM Selectors
- **Section ID:** `<section class="demo-section" id="demo-form">` (around line 1826)
- **Form Element:** `<form id="b2b-demo-form">` (line 1931)
- **Submit Button:** `<button type="submit" class="btn btn-primary" style="width: 100%;">` (line 1965)
- **Confirmation Container:** `<div id="form-success-message">` (line 1972)

### 2.2 Input Fields & Data Rules Compliance
The user data rules mandate collecting **ONLY**:
- `name` (required)
- `email` (required)
- `phone` (optional)
- `organization` (required)
- `department` (optional)

#### Current Fields Mapped:
| Existing Field ID | Label on Page | Target Attribute | Current Validation | Data Rule Compliance & Action |
|---|---|---|---|---|
| `input#full-name` | Doctor / Administrator Name * | `name` | `required` (text) | **Compliant** (B2B clinician name). |
| `input#work-email` | Official Work Email * | `email` | `required` (email) | **Compliant** (B2B hospital email). |
| `input#organization-name` | Hospital / Healthcare Group Name * | `organization` | `required` (text) | **Compliant** (Hospital entity name). |
| `select#specialty` | Target Department * | `department` | `required` (select) | **Flagged**: Currently marked `required`. Make optional or keep default "General Surgery". |
| `input#phone-number` | Official Mobile / WhatsApp Number * | `phone` | `required` (tel) | **Flagged**: Currently marked `required`. Change to optional per data rules. |
| *Honeypot field* | *None* | `website` | *Missing* | **Action Required**: Inject hidden `website` field for bot trapping. |
| *Error message container* | *None* | *Missing* | *Missing* | **Action Required**: Add graceful error notification element. |

#### Patient / Health-Related Data Audit:
- **Result:** **ZERO patient, clinical health, or diagnostic data fields found.**
- The existing form strictly requests B2B organizational and contact details (doctor name, hospital affiliation, work email, phone, target department).
- No Protected Health Information (PHI) or patient identifiable records are captured in this form.

---

## 3. Existing Submit Logic Inspection (`js/main.js`)

In `js/main.js` (lines 407–430):
```javascript
/* 5. B2B Consultation / Demo Booking Form */
function initDemoForm() {
  const form = document.getElementById('b2b-demo-form');
  const formSuccess = document.getElementById('form-success-message');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = '<span>Scheduling Demonstration...</span>';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        form.style.display = 'none';
        if (formSuccess) {
          formSuccess.style.display = 'block';
        }
      }, 700);
    });
  }
}
```

### 3.1 Deficiencies in Current Implementation:
1. **No Data Extraction:** The input values (`#full-name`, `#work-email`, etc.) are never read from the DOM.
2. **No Network Transmission:** No `fetch()` or `XMLHttpRequest` is dispatched; data is dropped immediately.
3. **Simulated State:** The form simply hides after 700ms and shows `#form-success-message`.
4. **No Error Handling:** If network errors occur, the UI has no failure state or retry mechanism.

---

## 4. Implementation Blueprint (Phases 2–5)

1. **Phase 2: `/api/leads.js` Serverless Function**:
   - Vercel Serverless Function supporting `POST` and `OPTIONS` preflight with strict CORS filtering (`ALLOWED_ORIGINS`).
   - Server-side field validation and size restriction (~10 KB).
   - Honeypot check: If `website` is populated, return immediate HTTP 200 and silently drop the spam payload.
   - Optional Cloudflare Turnstile token verification (`TURNSTILE_SECRET_KEY`).
   - Dual rate limiting: `@upstash/ratelimit` when configured; in-memory fallback when unconfigured.
   - Dual-write resilience: Google Sheets Web App first $\rightarrow$ Resend transactional email to `hi@pattacare.com`.
   - Fault-tolerant return codes: If either succeeds, return 200 OK. If both fail, return HTTP 502.
   - PII privacy: Log only `request_id`, `status`, and `error_type`—never full payloads.

2. **Phase 3: Frontend Integration**:
   - Update `index.html`: Inject `<input type="text" name="website" id="website" style="display:none !important;" tabindex="-1" autocomplete="off">`. Add `#form-error-message` container. Make phone optional.
   - Update `js/main.js`: Implement `async/await` `fetch('/api/leads')` with loading spinner, success transition, and graceful error alerts.

3. **Phase 4: Google Apps Script Web App**:
   - Create `docs/google-sheets-crm-setup.md` with complete, copy-pasteable Google Apps Script `doPost(e)` code and deployment guide.

4. **Phase 5: Local & cURL Verification**:
   - Validate API locally with mock B2B payload testing validation, honeypot, rate limiting, and dual-write paths.
