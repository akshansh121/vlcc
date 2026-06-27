# CLAUDE.md — Beauty World (VLCC)

## What This Project Is

Full-stack luxury beauty parlour booking platform called **Beauty World**.
Customers browse services, book appointments, manage cart, apply coupons, pay via Razorpay.
Admins manage everything via a dashboard with analytics.

---

## Project Layout

```
vlcc/
├── backend/          # Express.js API server (port 5000 local / 8000 Docker)
│   ├── server.js     # Entry point
│   ├── controllers/  # Business logic per domain
│   ├── routes/       # Express routers
│   ├── middleware/   # auth.js, errorHandler.js, upload.js
│   ├── config/       # database.js (pg.Pool), swagger.js, perfIndexes.js
│   └── utils/        # email.js (nodemailer templates), helpers.js
├── frontend/         # Next.js 14 app (port 3000)
│   ├── app/          # App router pages
│   │   └── admin/    # Admin dashboard pages
│   ├── components/   # Reusable UI components
│   ├── contexts/     # AuthContext, CartContext, ThemeContext
│   └── lib/api.js    # Axios instance + all API calls
├── database/
│   └── init.sql      # Schema + seed data (runs on first docker-compose up)
├── docs/
│   └── DEPLOYMENT.md # Nginx + SSL production guide
├── docker-compose.yml
└── .env.example
```

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | Next.js 14, React 18, Tailwind CSS 3, Framer Motion, Recharts, Axios |
| Backend   | Node.js 20, Express.js 4, pg (PostgreSQL driver), JWT, bcryptjs |
| Database  | PostgreSQL 15 (pool: max 20 connections) |
| Auth      | JWT + Google OAuth (`google-auth-library`, `@react-oauth/google`) |
| Payments  | Razorpay |
| Email     | Nodemailer (Gmail SMTP) |
| Security  | Helmet, CORS, express-rate-limit (100/15min; auth: 20/15min) |
| File uploads | Multer (5MB limit, JPEG/PNG/WebP) |
| API Docs  | Swagger UI at `GET /api/docs` |
| Container | Docker Compose (postgres:15-alpine, node:20-alpine) |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Customer accounts (role, is_blocked) |
| `admins` | Admin accounts |
| `categories` | Hair, Skin, Makeup, Nail, Body |
| `services` | Individual services (price, duration, image, category_id) |
| `packages` | Silver/Gold/Platinum bundles |
| `package_services` | Many-to-many: packages ↔ services |
| `staff` | Beautician profiles |
| `bookings` | Appointments (status, payment_method, payment_status) |
| `booking_items` | Services inside a booking |
| `offers` | Discount coupons (code, type, value, usage_limit, start/end dates) |
| `offer_services` | Coupon scoped to specific services |
| `cart_items` | User cart (user_id, service_id, quantity) |
| `testimonials` | Customer reviews (rating 1-5) |
| `contact_queries` | Contact form submissions |
| `time_slots` | Available appointment times with max_bookings capacity |

UUID-OSSP extension used. `updated_at` auto-managed by trigger.

---

## Key API Routes

Base: `/api` (all routes prefixed)

```
POST   /auth/send-registration-otp
POST   /auth/register
POST   /auth/login
POST   /auth/admin/login
POST   /auth/google
GET    /auth/me
POST   /auth/forgot-password  →  verify-otp  →  reset-password

GET    /services               # public list with filters
POST   /services               # admin only
PUT    /services/:id           # admin only

GET    /bookings/slots?date=   # available time slots
POST   /bookings               # create booking (auth required)
PUT    /bookings/:id/status    # admin update status

GET    /cart
POST   /cart/add
POST   /cart/apply-offer       # validate & apply coupon

POST   /payments/create-order  # Razorpay order

GET    /admin/dashboard        # analytics
GET    /admin/revenue
GET    /admin/users

GET    /health                 # health check
GET    /docs                   # Swagger UI
```

---

## Environment Variables

### Root `.env` (Docker Compose)
```
POSTGRES_DB=beauty_world
POSTGRES_USER=beauty_admin
POSTGRES_PASSWORD=
JWT_SECRET=
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_API_URL=http://localhost:8000/api
EMAIL_USER=
EMAIL_PASS=
CORS_ORIGIN=http://localhost:3000
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ADMIN_EMAIL=
FRONTEND_URL=http://localhost:3000
```

### Backend `.env` (local dev without Docker)
```
PORT=5000
DATABASE_URL=postgresql://beauty_admin:password@localhost:5432/beauty_world
JWT_SECRET=
... (same as above)
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

---

## Run Commands

### Docker (recommended)
```bash
docker-compose up -d          # start everything
docker-compose down           # stop
docker-compose down -v        # reset DB (removes volumes)
```

### Local Dev
```bash
# Backend
cd backend && npm install && npm run dev    # nodemon on :5000

# Frontend
cd frontend && npm install && npm run dev  # Next.js on :3000

# DB (local, no Docker)
psql -U postgres -c "CREATE DATABASE beauty_world;"
psql -U postgres -d beauty_world -f database/init.sql
```

### Frontend build
```bash
cd frontend && npm run build && npm start
npm run lint    # ESLint
```

---

## Default Credentials (from init.sql seed)

- **Admin email:** `abc@gmail.com`
- **Admin password:** `123456789`

---

## Design System (premium look & motion)

Defined in [tailwind.config.js](vlcc/frontend/tailwind.config.js) + [app/globals.css](vlcc/frontend/app/globals.css). Reuse these — don't hand-roll new gradients/shadows.

**Palette**
- Dark base is a **warm plum-espresso near-black** (CSS vars `--dark-900..500` in globals). Gold pops against the warmth = luxury feel. Don't revert to pure black.
- Accent gold `#D4AF37` (`gold-*`). Secondary `blush-*` / `champagne-*` added in config.
- Light mode = rose (`#f43f5e`), driven entirely by `html:not(.dark)` overrides at the bottom of globals.css. **Any new gold gradient/shadow needs a matching `html:not(.dark)` rose override** or it leaks gold into light mode.

**Utility classes (globals.css `@layer components`)**
- `.btn-gold` — animated champagne-gradient fill + glow + lift on hover.
- `.btn-outline-gold` — gold fill sweeps in via `::before` (needs `isolation:isolate`, already set).
- `.text-shimmer-gold` — animated shimmering gold text (used for "Beauty World" wordmark, hero "Luxury").
- `.glow-orb` — soft ambient radial glow; place inside a `relative` parent, render BEFORE the content div so content paints above. Pair with `animate-glow-pulse`.
- `.divider-luxe` — hairline divider with side ticks.
- `.section-subtitle` — eyebrow label; auto-prepends a gradient tick via `::before`.
- `.card-premium` — card surface with luxury shadow on hover.

**Motion tokens (config)**
- Easing: `ease-luxury` (cubic-bezier .22,1,.36,1) and `ease-silk`. Use `ease-luxury` for premium transitions.
- Animations: `animate-ken-burns` (slow image drift), `animate-glow-pulse`, `animate-shimmer`/`-slow`, `animate-float`, `animate-gradient-pan`.
- Shadows: `shadow-gold`, `shadow-gold-lg`, `shadow-glow`, `shadow-premium`.
- `prefers-reduced-motion` is respected globally (globals.css).
- Section reveals use framer-motion `useInView({ once: true })` + `fadeUp` variants — follow that pattern for new sections.

## Frontend Architecture Notes

- `lib/api.js` — single Axios instance; all API functions live here; JWT injected via request interceptor; 401 auto-logout via response interceptor
- `contexts/AuthContext.js` — global user state; wraps entire app
- `contexts/CartContext.js` — cart state; persists via API (not localStorage)
- `contexts/ThemeContext.js` — dark/light mode toggle
- Pages under `app/admin/` all require admin JWT; redirect to `/admin/login` if missing
- Tailwind custom colors: `gold` and `dark` palette defined in `tailwind.config.js`

---

## Backend Architecture Notes

- `server.js` registers all routers, middleware (helmet, cors, compression, rate-limit), starts pool
- `middleware/auth.js` exports: `authenticateUser` (JWT user), `authenticateAdmin` (JWT admin), checks `is_blocked`
- `middleware/errorHandler.js` handles pg errors (23505 unique, 23503 FK), JWT errors, Multer errors
- `config/database.js` — `pg.Pool` exported as `pool`; all queries use `pool.query()`
- `config/perfIndexes.js` — runs `CREATE INDEX IF NOT EXISTS` on startup (fire-and-forget)
- `utils/email.js` — HTML email templates for welcome, booking confirm/cancel/complete, OTP, contact notifications
- `controllers/bookingController.js` is the most complex file (33KB) — handles slot availability logic

---

## File Upload Paths

Uploaded images stored under `backend/uploads/`:
- `uploads/services/`
- `uploads/packages/`
- `uploads/staff/`
- `uploads/testimonials/`

Served as static files by Express.

---

## Payments Flow

1. `POST /payments/create-order` → Razorpay order created, returns `order_id`
2. Frontend opens Razorpay checkout widget
3. On success, `POST /bookings` with `payment_reference` and `payment_status: 'completed'`

---

## Booking Flow

1. User adds services to cart
2. Selects date → fetches available slots (`GET /bookings/slots?date=`)
3. Applies coupon optionally
4. Confirms → `POST /bookings` creates booking + booking_items records
5. Email confirmation sent via Nodemailer

---

## Common Patterns

- All admin routes: require `authenticateAdmin` middleware
- All user routes: require `authenticateUser` middleware
- Pagination: `?page=1&limit=10` query params on list endpoints
- Image upload: `multipart/form-data` with field name matching resource type
- Soft deletes: services/staff use `is_active` flag, not DELETE from DB
