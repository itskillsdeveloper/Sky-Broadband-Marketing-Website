# Sky Broadband — Marketing Website

Public marketing site for **Sky Broadband** (React + Vite), deployed on **Vercel**.
All content — text, logo, plans, offers/announcements, coverage areas,
testimonials, FAQs, contact details and social links — is managed from the
**ISP Billing app** and fetched live at runtime. The contact form delivers leads
straight to WhatsApp.

> Billing app / CMS repo: **https://github.com/itskillsdeveloper/ISP-Billing**

---

## How it connects

```
┌──────────────────────────┐     GET /api/website/content      ┌────────────────────────┐
│  ISP Billing app (Flask)  │  ───────────────────────────────▶ │  This site (Vercel)     │
│  Settings → Website        │     (public, CORS JSON)           │  reads VITE_API_URL     │
│  edits content + lead no.  │ ◀── POST /api/website/contact ──  │  contact form → WhatsApp│
└──────────────────────────┘                                    └────────────────────────┘
```

The **only link** is one environment variable — `VITE_API_URL` — pointing at the
billing app. If the API is unreachable, the site renders built-in default content.

| It calls | Purpose |
|---|---|
| `GET  ${VITE_API_URL}/api/website/content` | Live content the site renders |
| `POST ${VITE_API_URL}/api/website/contact` | Contact-form lead → business WhatsApp |

---

## Environment

Copy `.env.example` → `.env` and set:

```bash
# Base URL of the ISP Billing app
VITE_API_URL=https://billing.yourdomain.com   # local: http://localhost:4118
```

`VITE_API_URL` is baked in at **build time** — change it ⇒ redeploy.

---

## Run locally

```bash
npm install
cp .env.example .env        # set VITE_API_URL=http://localhost:4118
npm run dev                 # http://localhost:5173
```

The billing app must be running and reachable at `VITE_API_URL`.

---

## Deploy to Vercel

### Dashboard
1. [vercel.com](https://vercel.com) → **Add New → Project** → import this repo.
2. **Root Directory**: `.` · Framework: **Vite** (auto) · Build `npm run build` · Output `dist`.
3. **Environment Variables** → `VITE_API_URL = https://billing.yourdomain.com`.
4. **Deploy.**

### CLI
```bash
npm i -g vercel
vercel
vercel env add VITE_API_URL      # paste the billing app URL
vercel --prod
```

---

## Connect checklist (do this once)

1. **Billing app reachable over HTTPS** from the public internet (the browser
   calls it directly). Put it behind Nginx + Let's Encrypt.
2. On the **billing app** set:
   - `WEBSITE_CORS_ORIGIN` = this Vercel URL (or `*`)
   - `WEBSITE_PUBLIC_BASE_URL` = the billing app's HTTPS URL (for logo URLs)
   - WhatsApp microservice running **and linked to a phone** (for lead delivery)
3. On **Vercel** set `VITE_API_URL` = the billing app's HTTPS URL, then deploy.
4. In the billing app: **Settings → Website**, set "Receive contact-form leads on
   WhatsApp" to your number, edit content, **Save & publish**.
5. Open the Vercel URL → content loads; submit the contact form → lead arrives on
   WhatsApp.

### Quick test
```bash
curl -i https://billing.yourdomain.com/api/website/content   # 200 + CORS headers
```

---

## Stack
React 18 · Vite 5 · zero UI dependencies (inline-styled). Content & leads via the
ISP Billing API.
