# Beauty World - Luxury Beauty Parlour Booking Platform

A full-stack beauty parlour booking platform built with Next.js, Express.js, PostgreSQL, and Docker. Beauty World provides customers with a seamless online experience to browse services, manage a cart, apply discount offers, and book appointments — while giving admins a complete dashboard for managing the entire business.

---

## Features

### Customer-Facing
- **User Authentication** — JWT-based register, login, profile management, and password change
- **Service Browsing** — Browse 16+ services across 5 categories with search and category filter
- **Shopping Cart** — Persistent cart with quantity management and coupon application
- **Multi-Step Booking System** — Select services, pick a date and available time slot, confirm booking
- **Silver / Gold / Platinum Packages** — Curated service bundles at discounted prices
- **Offers & Discount Coupons** — Percentage and flat-rate coupons with usage limits and validity dates
- **Staff Profiles** — View beautician specializations and experience
- **Testimonials** — Customer reviews and ratings displayed on the landing page
- **Contact Form** — Submit queries directly to the admin team

### Admin Dashboard
- **Analytics Overview** — Revenue charts, booking stats, and user growth (powered by Recharts)
- **Booking Management** — View all bookings, update statuses (pending / confirmed / completed / cancelled)
- **Service & Category Management** — Create, edit, and soft-delete services
- **Package Management** — Build and maintain Silver / Gold / Platinum packages with linked services
- **Staff Management** — Add / edit / toggle staff profiles
- **Offer Management** — Create time-bound coupon codes with discount rules
- **User Management** — View users, block/unblock accounts, delete users
- **Contact Query Inbox** — Read and manage customer contact submissions
- **Testimonial Management** — Add and maintain customer testimonials

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, Tailwind CSS, Framer Motion |
| UI Utilities | React Hook Form, React Hot Toast, Lucide React, Recharts |
| Backend | Node.js, Express.js 4, JWT (jsonwebtoken), bcryptjs |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Database | PostgreSQL 15 |
| File Uploads | Multer |
| Email | Nodemailer (SMTP / Gmail App Password) |
| DevOps | Docker, Docker Compose |

---

## Quick Start (One Command)

> **Prerequisites:** Docker and Docker Compose installed on your machine.

```bash
git clone <repo-url>
cd beauty-world
docker-compose up -d
```

Docker Compose spins up three containers:

| Service | URL |
|---|---|
| Frontend (Next.js) | http://localhost:3000 |
| Backend API (Express) | http://localhost:5000 |
| Interactive API Docs | http://localhost:5000/api/docs |
| API Health Check | http://localhost:5000/api/health |
| PostgreSQL | localhost:5432 |

The database is automatically initialised with the schema and seed data on first run via `database/init.sql`.

---

## Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | abc@gmail.com | 123456789 |

> Change these credentials immediately in any environment that is not purely local development.

---

## Environment Variables

### Root `.env` (consumed by Docker Compose)

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_DB` | `beauty_world` | PostgreSQL database name |
| `POSTGRES_USER` | `beauty_admin` | PostgreSQL superuser username |
| `POSTGRES_PASSWORD` | `beauty_password_2024` | PostgreSQL superuser password |
| `JWT_SECRET` | _(see .env.example)_ | Secret key used to sign JWT tokens |
| `EMAIL_USER` | — | Gmail address used for outbound email |
| `EMAIL_PASS` | — | Gmail App Password (not your Gmail password) |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | API base URL used by the frontend |

### Backend `.env` (for local development without Docker)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://beauty_admin:...@localhost:5432/beauty_world` | Full PostgreSQL connection string |
| `JWT_SECRET` | _(required)_ | Must be a long, random string in production |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiry duration |
| `PORT` | `5000` | Port the Express server listens on |
| `CORS_ORIGIN` | `http://localhost:3000` | Comma-separated list of allowed CORS origins |
| `EMAIL_HOST` | `smtp.gmail.com` | SMTP host |
| `EMAIL_PORT` | `587` | SMTP port |
| `EMAIL_USER` | — | SMTP username |
| `EMAIL_PASS` | — | SMTP password / app password |
| `EMAIL_FROM` | `Beauty World <noreply@beautyworld.com>` | Sender name and address |
| `UPLOAD_DIR` | `./uploads` | Directory where uploaded images are stored |

### Frontend `.env.local` (for local development without Docker)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | API base URL consumed by Next.js |

---

## Project Structure

```
beauty-world/
├── docker-compose.yml          # Orchestrates all three containers
├── .env.example                # Root environment template
├── database/
│   └── init.sql                # Schema + seed data (auto-runs in Docker)
├── backend/
│   ├── server.js               # Express app entry point
│   ├── Dockerfile
│   ├── .env.example
│   ├── config/
│   │   ├── database.js         # pg Pool configuration
│   │   └── swagger.js          # Swagger / OpenAPI setup
│   ├── controllers/            # Business logic handlers
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── cartController.js
│   │   ├── contactController.js
│   │   ├── offerController.js
│   │   ├── packageController.js
│   │   ├── serviceController.js
│   │   ├── staffController.js
│   │   └── testimonialController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication guards
│   │   ├── errorHandler.js     # Global error + 404 handler
│   │   └── upload.js           # Multer file upload config
│   ├── routes/                 # Express routers (one per resource)
│   └── utils/
│       ├── email.js            # Nodemailer helper
│       └── helpers.js          # Shared utility functions
├── frontend/
│   ├── Dockerfile
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── .env.local.example
│   ├── app/
│   │   ├── layout.js           # Root layout with Navbar/Footer
│   │   ├── page.js             # Home page
│   │   └── globals.css
│   ├── components/             # Reusable UI components
│   │   ├── Navbar.js
│   │   ├── Hero.js
│   │   ├── FeaturedServices.js
│   │   ├── PackagesSection.js
│   │   ├── StaffSection.js
│   │   ├── TestimonialsSection.js
│   │   ├── ContactSection.js
│   │   ├── Footer.js
│   │   └── ...
│   ├── contexts/
│   │   ├── AuthContext.js      # JWT auth state + helpers
│   │   └── CartContext.js      # Cart state management
│   └── lib/
│       └── api.js              # Axios instance with base URL
└── docs/
    └── DEPLOYMENT.md           # Production deployment guide
```

---

## API Endpoints Summary

All endpoints are prefixed with `/api`. Interactive documentation is available at `http://localhost:5000/api/docs`.

### Authentication — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user account |
| POST | `/auth/login` | Public | Log in and receive a JWT |
| POST | `/auth/admin/login` | Public | Admin login (separate JWT) |
| GET | `/auth/me` | User | Get the authenticated user's profile |
| PUT | `/auth/me` | User | Update name / mobile |
| POST | `/auth/change-password` | User | Change password |

### Services — `/api/services`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/services?category_id=&search=&page=&limit=` | Public | List services with optional filters |
| GET | `/services/:id` | Public | Get a single service |
| POST | `/services` | Admin | Create a service |
| PUT | `/services/:id` | Admin | Update a service |
| DELETE | `/services/:id` | Admin | Toggle service active state |

### Packages — `/api/packages`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/packages` | Public | List all active packages |
| GET | `/packages/:id` | Public | Get a package with its services |
| POST | `/packages` | Admin | Create a package |
| PUT | `/packages/:id` | Admin | Update package details |
| DELETE | `/packages/:id` | Admin | Delete a package |
| POST | `/packages/:id/services` | Admin | Add a service to a package |
| DELETE | `/packages/:id/services/:serviceId` | Admin | Remove a service from a package |

### Staff — `/api/staff`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/staff` | Public | List all active staff members |
| GET | `/staff/:id` | Public | Get a staff member |
| POST | `/staff` | Admin | Add a staff member |
| PUT | `/staff/:id` | Admin | Update staff details |
| DELETE | `/staff/:id` | Admin | Toggle staff active state |

### Bookings — `/api/bookings`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/bookings/slots?date=YYYY-MM-DD` | Public | Get available time slots for a date |
| GET | `/bookings` | User | Get the current user's bookings |
| GET | `/bookings/:id` | User | Get a single booking |
| POST | `/bookings` | User | Create a booking |
| DELETE | `/bookings/:id` | User | Cancel a booking |
| GET | `/bookings/all` | Admin | List all bookings |
| PUT | `/bookings/:id/status` | Admin | Update booking status |
| GET | `/bookings/stats/overview` | Admin | Booking statistics overview |

### Cart — `/api/cart`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/cart` | User | Get the current user's cart |
| POST | `/cart/add` | User | Add a service to cart |
| POST | `/cart/apply-offer` | User | Apply a coupon code to cart |
| PUT | `/cart/:serviceId` | User | Update item quantity |
| DELETE | `/cart/:serviceId` | User | Remove a single item |
| DELETE | `/cart` | User | Clear the entire cart |

### Offers — `/api/offers`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/offers` | Public | List active offers |
| POST | `/offers/validate` | Public | Validate a coupon code against a cart total |
| GET | `/offers/all` | Admin | List all offers including expired |
| GET | `/offers/:id` | Public | Get a single offer |
| POST | `/offers` | Admin | Create an offer |
| PUT | `/offers/:id` | Admin | Update an offer |
| DELETE | `/offers/:id` | Admin | Delete an offer |

### Testimonials — `/api/testimonials`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/testimonials` | Public | List active testimonials |
| POST | `/testimonials` | Admin | Create a testimonial |
| PUT | `/testimonials/:id` | Admin | Update a testimonial |
| DELETE | `/testimonials/:id` | Admin | Delete a testimonial |

### Contact — `/api/contact`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/contact` | Public | Submit a contact query |
| GET | `/contact` | Admin | List all contact queries |
| PUT | `/contact/:id/read` | Admin | Mark a query as read |
| DELETE | `/contact/:id` | Admin | Delete a query |

### Admin — `/api/admin`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/dashboard` | Admin | Full dashboard metrics |
| GET | `/admin/revenue` | Admin | Revenue breakdown and chart data |
| GET | `/admin/users` | Admin | List all registered users |
| GET | `/admin/users/:id` | Admin | Get user details and booking history |
| PUT | `/admin/users/:id/block` | Admin | Toggle block/unblock a user |
| DELETE | `/admin/users/:id` | Admin | Delete a user account |

### System

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | Public | Service health check |

---

## Development Setup (Without Docker)

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL to your local PostgreSQL instance
npm install
# Create the database and run the init script
psql -U postgres -c "CREATE DATABASE beauty_world;"
psql -U postgres -d beauty_world -f ../database/init.sql
npm run dev     # starts with nodemon on port 5000
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Ensure NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev     # starts Next.js dev server on port 3000
```

---

## Database

### Schema Overview

| Table | Purpose |
|---|---|
| `users` | Registered customer accounts |
| `admins` | Admin accounts with role |
| `categories` | Service categories (Hair, Skin, Makeup, Nail, Body) |
| `services` | Individual services with pricing and duration |
| `packages` | Silver / Gold / Platinum bundles |
| `package_services` | Many-to-many: packages to services |
| `staff` | Staff profiles and specializations |
| `bookings` | Customer appointment records |
| `booking_items` | Individual services within a booking |
| `cart_items` | Persistent shopping cart (user + service) |
| `offers` | Discount coupons with rules and validity |
| `offer_services` | Offers scoped to specific services |
| `testimonials` | Customer reviews displayed on site |
| `contact_queries` | Messages submitted via the contact form |
| `time_slots` | Available appointment slots with capacity |

All mutable tables have an `updated_at` timestamp maintained by a PostgreSQL trigger.

### Reset and Reseed

```bash
# Drop and recreate the database (local dev only)
psql -U postgres -c "DROP DATABASE IF EXISTS beauty_world;"
psql -U postgres -c "CREATE DATABASE beauty_world;"
psql -U postgres -d beauty_world -f database/init.sql
```

With Docker, delete the named volume to force a full reinitialisation:

```bash
docker-compose down -v
docker-compose up -d
```

---

## Rate Limiting

The API applies rate limiting to all `/api/*` routes (100 requests per 15 minutes per IP). Authentication routes (`/api/auth/*`) have a stricter limit of 20 requests per 15 minutes to mitigate brute-force attacks.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request against `main`

---

## License

MIT
