# FixSure - Local Repair Warranty Platform

FixSure is a digital warranty platform for local repair shops in India. It builds trust between customers and repair shops ("Mistris") by providing a digital, verifiable warranty system.

## Features (MVP)
- **Landing Page**: Value proposition for Shops and Customers.
- **Partner Login**: Simple phone-based authentication (Mock).
- **Shop Dashboard**: Issue new digital warranties, track stats.
- **Customer Verification**: Scan QR code (URL) to verify warranty status.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS (v4)
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Homepage: [http://localhost:3000](http://localhost:3000)
   - Shop Login: [http://localhost:3000/login](http://localhost:3000/login)
   - Demo Verification: [http://localhost:3000/verify/demo](http://localhost:3000/verify/demo)

## Project Structure
- `app/`: Main application routes.
- `app/dashboard`: Shop owner interface.
- `app/verify`: Public verification page.
- `lib/utils.ts`: Utility functions.

## Future Roadmap
- Integration with Supabase/Postgres.
- SMS/WhatsApp API integration (Twilio/Interakt).
- Razorpay Subscription integration.
