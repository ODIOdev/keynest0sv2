# Realfy — Realtor / Broker Website + CRM

Public marketing site inspired by [Realfy (Webflow)](https://realvy-real-estate.webflow.io), plus an admin CRM for leads, listings, categories, agents, and image uploads.

## Stack

This project uses **Next.js** (not Vite). Next already includes React and ships with Tailwind. Vite would replace Next and break the CRM API routes, file uploads, and auth — so we keep Next for a single efficient full-stack app.

| Layer | Package |
|---|---|
| Framework | Next.js 16 (Turbopack) |
| UI | React 19 + Tailwind CSS 4 |
| Smooth scroll | Lenis |
| Validation | Zod |
| Fonts | `next/font` (Inter + Outfit, `display: swap`) |
| Images | `next/image` (AVIF/WebP) |

## Quick start

```bash
npm install
npm run dev
```

- Website: [http://localhost:3000](http://localhost:3000)
- CRM dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- Auth: [http://localhost:3000/auth/sign-in](http://localhost:3000/auth/sign-in)
- Master admin: username `admin` / password `12345678` (override with `ADMIN_PASSWORD`, re-run `npm run seed:admin`)

Copy `.env.example` to `.env.local` to customize secrets.

## What’s included

### Public site
- Home page matching the Realfy layout (hero, featured properties, categories, about, stats, process, agents marquee, testimonials, blog, FAQ, contact)
- Properties listing + detail pages
- Agents, About, Contact pages
- Contact form creates CRM leads

### Dashboard CRM (`/dashboard`)
- Overview metrics
- **Leads CRM** — pipeline statuses (new → closed)
- **Properties** — create/edit listings with images, categories, agents
- **Categories** — manage property category tiles
- **Image upload portal** — store files in `/public/uploads`
- **Agents** — roster management

### Data
- JSON store at `data/db.json` (auto-seeded on first run from the Realfy demo content)
- Uploaded images live in `public/uploads/`

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm run start    # run production server
```
