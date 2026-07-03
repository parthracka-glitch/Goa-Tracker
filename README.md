# Car Rental Enquiry Platform

Public enquiry form + admin dashboard with day-wise storage and PDF/Excel export.

## What's included
- **Public page (`/`)** — enquiry form (name, phone, email, location, car interest, message). No login needed.
- **Admin login (`/admin/login`)** — single admin account, JWT-based.
- **Admin dashboard (`/admin/dashboard`)** — sidebar of dates with enquiry counts, table view per day, and:
  - Download **this day** as PDF or Excel
  - Download **a whole month** as PDF or Excel (one section/sheet per day)

Every enquiry is stamped with a `dateKey` (YYYY-MM-DD) at submission time — that's what all the day-wise grouping and exports run on.

---

## Local setup (15 min)

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
```
Edit `.env`:
- `MONGO_URI` — your MongoDB Atlas connection string (create a free cluster if you don't have one)
- `JWT_SECRET` — any long random string
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — the login you'll hand to your client

Then create the admin account and start the server:
```bash
npm run seed
npm start
```
Backend runs on `http://localhost:5000`.

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend runs on `http://localhost:5173`.

Test flow: submit an enquiry on `/`, then log in at `/admin/login` and see it appear.

---

## Production deploy (matches your existing Vercel + Render + Atlas setup)

### Backend → Render
1. Push this repo to GitHub.
2. New Web Service on Render, root directory `backend`.
3. Build command: `npm install` — Start command: `npm start`.
4. Add the same env vars from `.env` in Render's dashboard.
5. After first deploy, run `npm run seed` once via Render's Shell tab to create the admin account.

### Frontend → Vercel
1. New Project on Vercel, root directory `frontend`.
2. Add env var `VITE_API_BASE` = your Render backend URL.
3. Deploy.

### Backend CORS
Set `CLIENT_ORIGIN` in Render's env vars to your final Vercel URL, so only your frontend can hit the API.

---

## Handover checklist for your client
- [ ] Give him the admin username/password (from `ADMIN_USERNAME`/`ADMIN_PASSWORD`)
- [ ] Share the public form link (Vercel URL) — this is what he puts on his website/WhatsApp/business card
- [ ] Share the admin dashboard link (`<vercel-url>/admin/dashboard`)
- [ ] Confirm he can download a day and a month successfully before handoff

## Notes on scale (50 enquiries/day)
This comfortably handles 50+ enquiries/day on MongoDB Atlas's free tier — that's ~1,500/month, well within free-tier limits. No changes needed unless volume grows 10x+.
