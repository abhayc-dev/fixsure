# FixSure: Mobile App Integration Specification
## Project Overview
FixSure is a professional Repair Management System (RMS) designed for repair shops (Mobile, Motor, Electronics, etc.). This document provides the technical requirements, API endpoints, and data structures necessary to build a mobile application interface for the FixSure platform.

---

## 1. System Architecture
- **Web Frontend:** Next.js (Dashboard for Shops)
- **Backend API:** Express.js / Node.js (Hosted on Render)
- **Database:** PostgreSQL (Managed via Prisma ORM)
- **Base URL:** `https://fixsure-backend.onrender.com`
- **Data Format:** Content-Type: `application/json`

---

## 2. Authentication API (New)
The mobile app uses Email/Password authentication. After successful login, store the `shop.id` (UUID) locally for all future API requests.

| Endpoint | Method | Description | Body |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Authenticate shop owner | `{"email": "...", "password": "..."}` |
| `/api/auth/signup`| `POST` | Register a new shop | `{"email": "...", "password": "...", "phone": "...", "shopName": "..."}` |

**Login Response:**
```json
{
  "success": true,
  "shop": {
    "id": "uuid-here",
    "email": "owner@example.com",
    "shopName": "My Motor Works",
    "category": "MOTOR",
    "isVerified": true
  }
}
```

---

## 3. Data Models (Prisma Schema)
The mobile app should align with these core entities:

### A. Shop (The User)
Each shop owner is a unique tenant. All data (Jobs, Warranties) must be filtered by `shopId`.
- `id`: UUID (Primary Key)
- `shopName`: Name of the business
- `phone`: Primary contact/login identifier
- `category`: Business vertical (GENERAL, MOTOR, MOBILE, TV)

### B. JobSheet (The Core Work Order)
- `jobId`: Human-readable identifier (e.g., JO-10291)
- `customerName` / `customerPhone`: Customer contact info.
- `status`: [RECEIVED, IN_PROGRESS, READY, DELIVERED, CANCELLED]
- `technicalDetails`: (JSON Object) Flexible field for category-specific data.

### C. Warranty (Digital Claim)
- `shortCode`: Unique code for customer tracking.
- `expiresAt`: Calculated based on `issuedAt` + `durationDays`.

---

## 3. API Documentation

### A. Stats & Dashboard
| Endpoint | Method | Description | Query Params |
| :--- | :--- | :--- | :--- |
| `/api/stats/jobs` | `GET` | Get job counts by status | `shopId` |

**Response:**
```json
{ "received": 5, "inProgress": 2, "ready": 1, "delivered": 10 }
```

### B. Job Management
| Function | Method | Endpoint | Note |
| :--- | :--- | :--- | :--- |
| **Connectivity** | `GET` | `/` | Verify server is up |
| **Login** | `POST` | `/api/auth/login` | Returns `shopId` for other calls |
| **Signup** | `POST` | `/api/auth/signup` | Register new shop |
| **Get Stats** | `GET` | `/api/stats/jobs?shopId=...` | Dashboard summary |
| **Add New Job** | `POST` | `/api/jobs` | Create repair order |
| **List All Jobs** | `GET` | `/api/jobs?shopId=...` | Sync shop jobs |

---

### 1. Login (POST)
**URL:** `{{baseUrl}}/api/auth/login`  
**Body (JSON):**
```json
{
  "email": "owner@example.com",
  "password": "yourpassword"
}
```

### 2. Signup (POST)
**URL:** `{{baseUrl}}/api/auth/signup`  
**Body (JSON):**
```json
{
  "email": "newshop@gmail.com",
  "password": "strongpassword",
  "phone": "9988776655",
  "shopName": "Techno Repairs",
  "category": "MOBILE"
}
```

### 3. Add New Job (POST)
**POST /api/jobs Payload Example:**
```json
{
  "shopId": "uuid-here",
  "customerName": "John Doe",
  "customerPhone": "9876543210",
  "category": "MOTOR",
  "deviceModel": "Crompton 5HP",
  "problemDesc": "Not starting, humming sound",
  "estimatedCost": 2500,
  "advanceAmount": 500,
  "technicalDetails": {
    "motor": {
      "power": "5",
      "power_unit": "HP",
      "phase": "Triple"
    }
  }
}
```

---

## 4. Technical Details Handling (JSON)
The `technicalDetails` field is a JSON object. For a **MOTOR** category shop, it follows this structure:

```json
{
  "motor": {
    "power": "String",
    "phase": "Single/Triple",
    "starter_length": "String",
    "coilDetails": {
      "running": [{ "swg": "21", "weight": "2kg", "turns": "40" }],
      "starting": [{ "swg": "23", "weight": "1kg", "turns": "60" }]
    }
  }
}
```
*Note: The mobile app should dynamically render forms based on the `category` of the shop.*

---

## 5. Implementation Roadmap for App Developer
1. **Authentication:** Implement a login screen that verifies the Shop phone number. Use the `shopId` returned for all subsequent calls.
2. **Dashboard:** Pull stats from `/api/stats/jobs` and show a list of active (RECEIVED/IN_PROGRESS) jobs.
3. **Job Intake:** Create a form to POST new jobs. Use a QR scanner if you want to print labels later.
4. **Status Updates:** Implement a simple swipe action or button to move jobs from "In Progress" to "Ready".
5. **Customer Notify:** Use the `customerPhone` to trigger a WhatsApp intent: `https://wa.me/{phone}?text={message}`.

---

## 6. Pro Tips
- **Caching:** Since repair data doesn't change every second, use local caching (SQLite/Hive) for a smooth offline experience.
- **Polling:** Use a 30-second polling or Pull-to-Refresh to keep data in sync with the web dashboard.
- **Images:** The `technicalDetails` can also store base64 or URL strings if you decide to add "Before/After" photo features.

---
**Standard Header for Requests:**
`Content-Type: application/json`
`Accept: application/json`
