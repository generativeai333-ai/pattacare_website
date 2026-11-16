# PattaCare B2B Lead Capture: Google Sheets CRM Setup Guide

This guide details how to connect the PattaCare `/api/leads` serverless endpoint to a private Google Sheet using a serverless **Google Apps Script Web App**.

---

## 1. Sheet Setup & Column Headers

1. Open [Google Sheets](https://sheets.new) and create a new spreadsheet.
2. Name the spreadsheet: **`PattaCare B2B Inbound Leads`**.
3. In Row 1 of **Sheet1**, enter the following exact column headers:

| Cell | Column Header | Description |
|---|---|---|
| **A1** | `Timestamp` | ISO 8601 date & time of submission |
| **B1** | `Name` | Doctor or Hospital Administrator Name |
| **C1** | `Email` | Official Work Email |
| **D1** | `Phone` | Mobile or WhatsApp contact number |
| **E1** | `Organization` | Hospital or Healthcare Network Name |
| **F1** | `Department` | Target Surgical Specialty / Department |
| **G1** | `Request ID` | Unique UUID audit identifier |

---

## 2. Google Apps Script Code (`Code.gs`)

1. In your Google Sheet, click **Extensions** $\rightarrow$ **Apps Script**.
2. Replace all code in the script editor (`Code.gs`) with the following production-ready script:

```javascript
/**
 * PattaCare Inbound B2B Lead Webhook
 * Appends incoming demo requests from /api/leads into the active Google Sheet.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 10 seconds for concurrent write lock
  lock.tryLock(10000);

  try {
    var rawPostData = e.postData.contents;
    var data = JSON.parse(rawPostData);

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    var timestamp = data.timestamp || new Date().toISOString();
    var name = data.name || '';
    var email = data.email || '';
    var phone = data.phone || 'N/A';
    var organization = data.organization || '';
    var department = data.department || 'General Surgery';
    var requestId = data.request_id || '';

    // Append new lead row
    sheet.appendRow([
      timestamp,
      name,
      email,
      phone,
      organization,
      department,
      requestId
    ]);

    // Return CORS-compliant HTTP 200 JSON response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Lead appended successfully',
      request_id: requestId
    }))
    .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'active',
    service: 'PattaCare Lead Capture Webhook'
  }))
  .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 3. 3-Step Deployment Instructions

Follow these 3 steps to deploy the script as a Web App:

### Step 1: Deploy as Web App
1. At the top right of the Apps Script editor, click **Deploy** $\rightarrow$ **New deployment**.
2. Click the gear icon (**Select type**) and select **Web app**.

### Step 2: Configure Access Permissions
3. Fill in the deployment settings:
   - **Description:** `PattaCare Inbound Leads Webhook v1`
   - **Execute as:** `Me (your Google account)`
   - **Who has access:** `Anyone` *(Crucial: This allows Vercel's serverless function to POST data securely without Google OAuth login)*.
4. Click **Deploy**.
5. If prompted, click **Authorize Access**, select your Google account, click **Advanced**, and click **Go to PattaCare (unsafe)** to grant spreadsheet write permissions.

### Step 3: Copy Web App URL & Configure Vercel
6. Copy the generated **Web App URL** (looks like `https://script.google.com/macros/s/AKfycbx.../exec`).
7. In your [Vercel Dashboard](https://vercel.com) $\rightarrow$ **PattaCare Project** $\rightarrow$ **Settings** $\rightarrow$ **Environment Variables**, add:
   - **Name:** `GOOGLE_SHEETS_WEBHOOK_URL`
   - **Value:** `https://script.google.com/macros/s/AKfycbx.../exec`
8. Click **Save**.

---

## 4. Verification with cURL

Test your deployed Google Apps Script webhook directly from your terminal:

```bash
curl -X POST "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2026-11-16T12:00:00Z",
    "name": "Dr. Rajesh Varma",
    "email": "rajesh.varma@manipalhospitals.com",
    "phone": "+91 98765 43210",
    "organization": "Manipal Hospitals",
    "department": "General & Laparoscopic Surgery",
    "request_id": "test-uuid-1234"
  }'
```

A response of `{"status":"success","message":"Lead appended successfully"}` confirms the row has been added to your Google Sheet.
