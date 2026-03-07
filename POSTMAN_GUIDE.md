# FixSure Postman Testing Guide 🚀

Use this guide to verify the API endpoints before integrating them into the Mobile App.

### ⚙️ Pre-requisites
1. **Base URL:** `https://fixsure-backend.onrender.com`
2. **Headers:** Set `Content-Type` to `application/json` for all requests.

---

### 1️⃣ Step 1: Connectivity Check
- **Method:** `GET`
- **URL:** `{{baseUrl}}/`
- **Expected:** `{ "message": "FixSure API is running" }`

### 2️⃣ Step 2: Create Shop (Signup)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/auth/signup`
- **Body (raw JSON):**
```json
{
  "email": "shop_owner@example.com",
  "password": "Password123",
  "phone": "9876543210",
  "shopName": "Super Repairs",
  "category": "MOTOR"
}
```

### 3️⃣ Step 3: Login & Get shopId
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/auth/login`
- **Body (raw JSON):**
```json
{
  "email": "shop_owner@example.com",
  "password": "Password123"
}
```
*👉 Copy the `"id"` from the response. This is your `shopId` for the next steps.*

### 4️⃣ Step 4: Create Repair Job
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/jobs`
- **Body (raw JSON):**
```json
{
  "shopId": "PASTE_YOUR_ID_HERE",
  "customerName": "Ramesh",
  "customerPhone": "9000000000",
  "deviceType": "Submersible Pump",
  "deviceModel": "Kirloskar V4",
  "problemDesc": "Humming sound, no water",
  "estimatedCost": 2200,
  "advanceAmount": 500
}
```

### 5️⃣ Step 5: Check Dashboard Stats
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/stats/jobs?shopId=PASTE_YOUR_ID_HERE`

### 6️⃣ Step 6: Update Job Status
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/api/jobs/PASTE_JOB_ID_HERE/status`
- **Body (raw JSON):**
```json
{
  "status": "READY"
}
```

---
**💡 Dev Tip:** In Postman, use `{{shopId}}` as a variable in your collection to avoid pasting it every time.
