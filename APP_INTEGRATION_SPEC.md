# FixSure: Mobile App Integration Specification (v1.1)
## 1. Project Overview
FixSure is a professional Repair Management System (RMS). This document provides the unified API specification for developers building the FixSure Mobile Application.

---

## 2. Global Configuration
- **Production Base URL:** `https://fixsure-backend.onrender.com`
- **Development Base URL:** `http://localhost:8000`
- **Headers:** 
  - `Content-Type: application/json`
  - `Accept: application/json`

---

## 3. Authentication API
All endpoints except Login and Signup require the `shopId` obtained after authentication.

### A. Login
`POST /api/auth/login`
- **Body:** `{ "email": "String", "password": "String" }`
- **Success (200 OK):** Returns Shop object with `id` (the `shopId`).

### B. Signup
`POST /api/auth/signup`
- **Body:** `{ "email": "String", "password": "String", "phone": "String", "shopName": "String", "category": "String" }`
- **Default Category:** `GENERAL` (Options: MOTOR, MOBILE, TV, GENERAL)

---

## 4. Job Management API

### A. Dashboard Statistics
`GET /api/stats/jobs?shopId={uuid}`
- **Response:** `{ "received": Int, "inProgress": Int, "ready": Int, "delivered": Int }`

### B. List Jobs
`GET /api/jobs?shopId={uuid}`
- **Response:** Array of Job objects sorted by date (latest first).

### C. Create New Job
`POST /api/jobs`
- **Payload Structure:**
```json
{
  "shopId": "String (Required)",
  "customerName": "String (Required)",
  "customerPhone": "String (Required)",
  "customerAddress": "String (Optional)",
  "deviceType": "String (e.g., Submersible Pump, Mobile)",
  "deviceModel": "String (Required)",
  "problemDesc": "String (Required)",
  "accessories": "String (Optional)",
  "estimatedCost": "Number",
  "advanceAmount": "Number",
  "expectedAt": "DateTime String (ISO)",
  "technicalDetails": "JSON Object (Optional)"
}
```

### D. Update Job Status (Quick Action)
`PATCH /api/jobs/:id/status`
- **Body:** `{ "status": "String" }`
- **Enum Statuses:** `RECEIVED`, `IN_PROGRESS`, `READY`, `DELIVERED`, `CANCELLED`

### E. Full Job Update
`PUT /api/jobs/:id`
- **Body:** Same as Create payload (Update fields as needed).

---

## 5. Technical Details Schema (Category Specific)
For `category: "MOTOR"`, the `technicalDetails` field should follow this JSON structure:

```json
{
  "motor": {
    "power": "5",
    "power_unit": "HP",
    "phase": "Triple",
    "starter_length": "23",
    "starter_diameter": "66",
    "coilDetails": {
      "running": [
        { "swg": "21", "weight": "2kg", "turns": "40" }
      ],
      "starting": [
        { "swg": "23", "weight": "1kg", "turns": "60" }
      ],
      "runningTotalWeight": "2.0",
      "startingTotalWeight": "1.0"
    }
  }
}
```

---

## 6. Error Handling
The API returns a consistent error format for failed requests:
```json
{ "error": "Clear explanation of what went wrong" }
```
- **400:** Missing mandatory fields.
- **401:** Invalid login credentials.
- **500:** Internal server error.

---

## 7. Developer Guidelines
1. **Persistent Session:** Store the `shopId` and `shopName` in secure local storage after login.
2. **WhatsApp Integration:** Use the intent `https://wa.me/{phone}/?text={message}` for customer notifications.
3. **Draft Mode:** Since `technicalDetails` can be complex, implement a "Draft" feature in the app to save progress before final submission.
4. **Refreshing:** Use Pull-to-Refresh on the Job list to sync with the web dashboard.
## 8. Real-world Data Example
This is exactly how a complete Job object looks when retrieved from the API:

```json
{ 
    "id": "9b491554-ca5f-4599-b32c-eaeae3b19c84",
    "jobId": "JO-42857",
    "shopId": "7799c248-71df-4a69-a564-a73531294aed",
    "customerName": "Abhay Chaurasiya",
    "customerPhone": "930550552",
    "customerAddress": "Chakiya",
    "deviceType": "SEWELL",
    "deviceModel": "1222454345454",
    "problemDesc": "wwfe wfe fef efe f ef r",
    "accessories": null,
    "receivedAt": "2026-01-31T10:19:58.437Z",
    "expectedAt": "2026-02-06T00:00:00.000Z",
    "completedAt": null,
    "status": "RECEIVED",
    "estimatedCost": 3501,
    "advanceAmount": 500,
    "finalCost": null,
    "category": "MOTOR",
    "technicalDetails": {
        "motor": {
            "phase": "Triple",
            "power": "9",
            "speed": "32",
            "current": "23",
            "capacitor": "23",
            "power_unit": "kW",
            "coilDetails": {
                "running": [
                    {
                        "swg": "22",
                        "turns": "2",
                        "weight": "2"
                    },
                    {
                        "swg": "",
                        "turns": "",
                        "weight": ""
                    }
                ],
                "starting": [
                    {
                        "swg": "2",
                        "turns": "2",
                        "weight": "2"
                    }
                ]
            },
            "starter_length": "23",
            "starter_diameter": "66"
        }
    }
}
```