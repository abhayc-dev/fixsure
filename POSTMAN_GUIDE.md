| Function | Method | Endpoint | Note |
| :--- | :--- | :--- | :--- |
| **Connectivity** | `GET` | `/` | Verify server is up |
| **Login** | `POST` | `/api/auth/login` | Email/Password Login |
| **Signup** | `POST` | `/api/auth/signup` | Register Shop |
| **Get Stats** | `GET` | `/api/stats/jobs?shopId=...` | Dashboard counts |
| **Add New Job** | `POST` | `/api/jobs` | Create repair order |
| **List All Jobs** | `GET` | `/api/jobs?shopId=...` | Shop job history |
| **Delete Job** | `DELETE` | `/api/jobs/:id` | Remove record |

---

### Step 1: Login (POST)
**URL:** `https://fixsure-backend.onrender.com/api/auth/login`  
**Body > raw > JSON:**
```json
{
  "email": "owner@example.com",
  "password": "yourpassword"
}
```
*Note: Copy the `id` from the response `shop` object. This is your `shopId`.*

### Step 2: Signup (POST)
**URL:** `https://fixsure-backend.onrender.com/api/auth/signup`  
**Body > raw > JSON:**
```json
{
  "email": "testshop@gmail.com",
  "password": "password123",
  "phone": "9998887776",
  "shopName": "FixSure Mobile",
  "category": "MOBILE"
}
```

### Step 3: Create Job (POST)
**URL:** `https://fixsure-backend.onrender.com/api/jobs`  
**Body > raw > JSON:**
```json
{
  "shopId": "PASTE_YOUR_SHOP_ID_HERE",
  "customerName": "Amit Singh",
  "customerPhone": "9000000000",
  "category": "MOTOR",
  "deviceModel": "Crompton 5HP",
  "problemDesc": "Burning smell",
  "estimatedCost": 1200,
  "advanceAmount": 100
}
```

### Step 4: Get All Jobs (GET)
**URL:** `https://fixsure-backend.onrender.com/api/jobs?shopId=PASTE_YOUR_SHOP_ID_HERE`  

### Step 5: Update Status (PATCH)
**URL:** `https://fixsure-backend.onrender.com/api/jobs/JOB_UUID_HERE/status`  
**Body > raw > JSON:**
```json
{
  "status": "READY"
}
```
