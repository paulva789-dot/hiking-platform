# Trek Cameroon — Hiking & Sight-Seeing Guide Platform

A full-stack platform for hiking in Cameroon. The problem it solves is narrow and specific: people
who want to hike here don't, because the information available is vague, wrong or missing. So every
design decision points at one thing — **correct, checked, specific information**, plus the guides,
plans and durations to act on it.

Twelve real destinations, at least one in **each of Cameroon's ten regions**, from a 2-hour walk up
Mont Fébé in Yaoundé to a four-day trek into the Dja Faunal Reserve.

---

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Maps | Leaflet + OpenStreetMap |
| Weather | OpenWeather API (proxied and cached server-side) |
| Image storage | Cloudinary |

---

## Getting it running

### 1. Database

```bash
cd hiking-platform
docker compose up -d          # PostgreSQL 16 on localhost:5432
```

Or point `DATABASE_URL` at any PostgreSQL instance you already have.

### 2. Backend

```bash
cd backend
cp .env.example .env          # then fill in JWT_SECRET at minimum
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev                   # http://localhost:4000/api
```

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                   # http://localhost:3000
```

### Seeded accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@trekcameroon.cm` | `Admin@12345` |
| Hiker | `hiker@example.cm` | `Hike@12345` |
| Premium hiker | `premium@example.cm` | `Hike@12345` |
| Guide (approved) | `guide.buea@example.cm` | `Hike@12345` |
| Guide (pending) | `guide.pending@example.cm` | `Hike@12345` |

The login page has one-click buttons for the first three.

### Optional services

The app runs without these; the features that need them degrade with a clear message rather than
breaking.

- **`OPENWEATHER_API_KEY`** — free key from [openweathermap.org](https://openweathermap.org/api).
  Without it, the weather panel on each trail page says weather is not configured.
- **`CLOUDINARY_*`** — free tier at [cloudinary.com](https://cloudinary.com). Without it, photo and
  avatar uploads return a 503 explaining that image storage is not configured.

---

## Features by role

### Visitors (no account)
- Browse and search 12 destinations; filter by region, difficulty and time needed
- Interactive Leaflet map — every trailhead and route line, coloured by difficulty
- Full trail pages: measured distance, ascent, realistic duration, numbered waypoints with
  elevations, hazards, water sources, permit rules and how to get there
- Live weather with a plain-language verdict (*good to go / take care / not advisable*)
- Photo gallery, safety guidelines, guide directory, events, hiking groups

### Registered users
- Save favourite trails · write reviews (one per trail, editable) · upload photos
- Book guided tours with real seat availability · join hiking groups · buy event tickets

### Guides
- Create a profile → admin verification → tours go live
- Manage tours, departure dates and capacity; see bookings, contact details and net payout
- Paid Basic / Pro membership for directory placement

### Administrators
- Analytics: users, conversions, booking volume, commission earned, revenue by stream,
  trails by region and difficulty, most-viewed trails, top guides
- Trail CRUD, guide approvals, photo and review moderation, booking oversight, user management
- CMS for safety guidelines, partner/gear listings, events and ad slots

---

## Monetization — all eight strategies

| # | Strategy | Where it lives |
| --- | --- | --- |
| 1 | Tour booking commission | `BOOKING_COMMISSION_PCT` (default 12%). Recorded per booking in `Booking.commissionXAF` at reservation time, so historic rates survive a rate change. Visible to guides and in admin analytics. |
| 2 | Guide membership | `GuideProfile.plan` — `NONE` / `BASIC` / `PRO`. Pro sorts first in the guide directory. |
| 3 | Accommodation partnerships | `Listing` with `kind: ACCOMMODATION` → `/stay`. Outbound clicks route through `/api/content/listings/:id/go`, which counts the click before redirecting, so affiliate attribution works. |
| 4 | Equipment marketplace | Same `Listing` model with `kind: EQUIPMENT` → `/gear`, behind an honest kit checklist. |
| 5 | Premium membership | `User.tier` + `tierExpires`. Gated perk: `/api/content/offline-pack/:slug` returns route, waypoints, hazards and emergency numbers as a downloadable file. |
| 6 | Event ticket sales | `Event` + `EventTicket`, with atomic capacity claims. |
| 7 | Advertising | `AdSlot` with placements, weighted rotation, impression and click counting. |
| 8 | Photography marketplace | `Photo.forSale` + `priceXAF`; `PHOTO_COMMISSION_PCT` (default 20%) shown to buyers in the gallery. |

Payment activation endpoints (premium, guide membership) currently flip the state directly. In
production they'd be driven by a payment-provider webhook — MTN Mobile Money, Orange Money or card.
The state machines they drive are already built; only the payment hop is stubbed, and the UI says so.

---

## Things worth knowing about the implementation

**Seat booking is race-safe.** Two people booking the last seat at the same moment cannot both
succeed. The claim is a single conditional `UPDATE ... WHERE seatsBooked + n <= capacity RETURNING`
inside a transaction; the loser gets a 409 with the real number of seats left. Same pattern for event
tickets.

**Weather is proxied, not called from the browser.** The OpenWeather key stays server-side, responses
are cached per coordinate for 15 minutes, and the API returns a hiking verdict rather than making the
client interpret wind speed and visibility.

**Cloudinary uploads go through the API.** Multipart to Express → `upload_stream` to Cloudinary. The
API secret never reaches the browser. Non-admin uploads land in a moderation queue.

**Difficulty ratings are specific commitments**, not vibes — defined once in
[format.ts](frontend/src/lib/format.ts) and surfaced on the home page, the safety page and every trail
page. `EASY` = under 4 h on a clear path. `EXPERT` = multi-day, high altitude or big-game country.

**Cached ratings stay correct.** `Trail.ratingAvg` / `ratingCount` are recomputed from approved
reviews whenever a review is created, deleted or moderated.

**Destructive actions are guarded.** You can't delete a tour or trail with live bookings — the API
tells you to unpublish instead. Admins can't suspend themselves or drop their own admin role.

**Leaflet is loaded client-only** via a single `dynamic(..., { ssr: false })` module, so server
components can import the maps without SSR errors. Markers are `divIcon`s, which avoids Leaflet's
broken default-icon paths under a bundler and lets the pin colour carry the difficulty rating.

---

## Verified

- `npx tsc --noEmit` — clean
- `npm run build` (frontend) — clean, 32 routes generated
- `npx prisma validate` + `prisma generate` — schema valid, client generated
- API boots; health check, 404 handling, Zod validation errors, and auth guards all confirmed
  against a running server

**Not verified:** migrations, seed and any database-backed request. No PostgreSQL instance was
available in this environment (port 5432 closed, no Docker daemon reachable). Run `docker compose up
-d`, then `npx prisma migrate dev` and `npm run seed`, and exercise the flows before trusting the
data layer. The frontend build passing without an API is a deliberate property — every server-side
fetch has a fallback — not evidence that the API responses are right.

---

## Layout

```
hiking-platform/
├── docker-compose.yml
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # 16 models
│   │   ├── trails.data.js        # the 12 destinations + safety guidelines
│   │   └── seed.js
│   └── src/
│       ├── app.js  server.js  config.js
│       ├── lib/          prisma, cloudinary, token, errors, zod schemas
│       ├── middleware/   auth, validate, error
│       └── routes/       auth · trail · review · favorite · photo · guide
│                         booking · group · weather · content · admin
└── frontend/
    └── src/
        ├── app/          public pages, /dashboard, /guide, /admin
        ├── components/   ui, TrailCard, WeatherPanel, map/, trail/
        └── lib/          api client, auth context, types, formatters
```

---

## A note on the content

The trail descriptions, distances, hazards and permit notes are drawn from published route
descriptions, national-park literature and guide-association rates. They are written to be honest —
including where a trail is dangerous, where a region has a security situation, and where a sacred
site restricts access.

Treat any edit to `prisma/trails.data.js` as a content change that needs checking against a local
guide association before it goes live. That is the whole premise of the platform.
