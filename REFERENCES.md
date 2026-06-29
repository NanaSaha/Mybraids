# MyBraids — Full Project Reference

> **African Beauty Marketplace** — Angular 17 frontend · Node.js/Express API · MySQL database

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project File Structure](#3-project-file-structure)
4. [Pages & Routes](#4-pages--routes)
5. [Angular Components Reference](#5-angular-components-reference)
6. [Services Reference](#6-services-reference)
7. [MySQL Database Schema](#7-mysql-database-schema)
8. [Node.js / Express Backend API](#8-nodejs--express-backend-api)
9. [REST API Endpoints](#9-rest-api-endpoints)
10. [Authentication (JWT)](#10-authentication-jwt)
11. [File Upload (Cloudinary Free)](#11-file-upload-cloudinary-free)
12. [Design System](#12-design-system)
13. [Environment Configuration](#13-environment-configuration)
14. [Free Hosting Options](#14-free-hosting-options)
15. [Setup & Run Locally](#15-setup--run-locally)
16. [Deployment Guide](#16-deployment-guide)

---

## 1. Project Overview

MyBraids is a global marketplace where clients can **discover, browse, and book** talented beauty artists — hairstylists, makeup artists, lash technicians, nail artists, and skincare specialists — anywhere in the world.

**Key Features:**
- Client registration & login (JWT auth)
- Service provider registration with portfolio upload
- Location-based search with category filters
- 4-step appointment booking wizard
- Provider dashboard (bookings, gallery, availability, settings)
- Client dashboard (upcoming & past bookings)
- Star ratings & reviews
- African-inspired modern UI with Kente colour palette

---

## 2. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Angular 17 (standalone components) | Modern, typed, component-based |
| Styling | Custom SCSS design system | Full control, no heavy UI lib |
| Backend API | Node.js + Express.js | Lightweight REST API |
| Database | **MySQL** | Free tiers available, relational data |
| Auth | JWT (jsonwebtoken) | Stateless, works with any host |
| File Storage | Cloudinary (free tier) | 25GB free storage for images |
| Frontend hosting | Netlify or Vercel (free) | Free static hosting with CDN |
| Backend hosting | Railway / Render (free tier) | Free Node.js hosting |
| DB hosting | **PlanetScale / Aiven / db4free** | Free MySQL hosting |

---

## 3. Project File Structure

```
mybraids/
├── src/                                  # Angular frontend
│   ├── app/
│   │   ├── app.component.ts              # Root component
│   │   ├── app.config.ts                 # App providers (no Firebase)
│   │   ├── app.routes.ts                 # Lazy-loaded routes
│   │   ├── core/
│   │   │   ├── models/
│   │   │   │   ├── user.model.ts
│   │   │   │   ├── provider.model.ts
│   │   │   │   └── booking.model.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts       # JWT auth service
│   │   │   │   ├── provider.service.ts   # Provider CRUD via REST
│   │   │   │   ├── booking.service.ts    # Booking CRUD via REST
│   │   │   │   ├── upload.service.ts     # Cloudinary upload
│   │   │   │   └── api.service.ts        # Base HTTP service
│   │   │   └── guards/
│   │   │       └── auth.guard.ts
│   │   ├── shared/
│   │   │   └── components/
│   │   │       ├── navbar/
│   │   │       ├── footer/
│   │   │       └── provider-card/
│   │   └── pages/
│   │       ├── home/
│   │       ├── search/
│   │       ├── provider-profile/
│   │       ├── booking/
│   │       ├── auth/
│   │       │   ├── login/
│   │       │   └── register/
│   │       └── dashboard/
│   │           ├── client-dashboard/
│   │           └── provider-dashboard/
│   ├── environments/
│   │   ├── environment.ts                # Dev: points to localhost:3000
│   │   └── environment.prod.ts           # Prod: points to your API URL
│   ├── styles.scss                       # Global design system
│   └── index.html
│
├── backend/                              # Node.js + Express API
│   ├── src/
│   │   ├── server.js                     # Entry point
│   │   ├── config/
│   │   │   └── db.js                     # MySQL connection pool
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js        # JWT verification
│   │   │   └── upload.middleware.js      # Cloudinary multer
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── provider.routes.js
│   │   │   ├── booking.routes.js
│   │   │   ├── review.routes.js
│   │   │   └── upload.routes.js
│   │   └── controllers/
│   │       ├── auth.controller.js
│   │       ├── provider.controller.js
│   │       ├── booking.controller.js
│   │       └── review.controller.js
│   ├── migrations/
│   │   └── 001_initial_schema.sql        # Full MySQL schema
│   ├── .env                              # Environment variables
│   └── package.json
│
├── angular.json
├── package.json
├── tsconfig.json
└── REFERENCES.md                         # This file
```

---

## 4. Pages & Routes

| Route | Component | Auth Required | Description |
|-------|-----------|:---:|-------------|
| `/` | `HomeComponent` | No | Hero search, featured artists, stats, testimonials |
| `/search` | `SearchComponent` | No | Filter & browse all providers |
| `/provider/:id` | `ProviderProfileComponent` | No | Full profile, gallery, services, reviews |
| `/book/:providerId` | `BookingComponent` | Client | 4-step booking wizard |
| `/auth/login` | `LoginComponent` | No | Email/password login |
| `/auth/register` | `RegisterComponent` | No | Register as client or artist |
| `/dashboard/client` | `ClientDashboardComponent` | Client | View & manage bookings |
| `/dashboard/provider` | `ProviderDashboardComponent` | Provider | Stats, bookings, portfolio, settings |

---

## 5. Angular Components Reference

### `NavbarComponent`
- Fixed header, scrolled state with backdrop blur
- Desktop: logo · nav links · action buttons
- Mobile: hamburger menu with slide-down drawer
- Shows user avatar + dropdown when authenticated
- Signals: `isScrolled`, `mobileMenuOpen`, `userMenuOpen`

### `FooterComponent`
- Multi-column grid: brand · services · for artists · company
- Kente strip top border
- Social media links

### `ProviderCardComponent`
- **Inputs:** `provider: Provider`, `index: number` (for gradient)
- Gradient avatar with initials (no image dependency for demo)
- Verified badge, Featured badge
- Star rating, review count
- Specialties as pill tags
- Starting price + Book Now CTA

### `HomeComponent`
- Hero with animated rings, floating provider cards
- Category quick-links horizontal scroll
- How It Works 3-step cards
- Featured providers grid (6 cards)
- Stats banner (dark African pattern bg)
- Popular locations grid (8 cities)
- Testimonials 3-column grid
- Provider CTA with mock dashboard preview

### `SearchComponent`
- Sticky search header (location + category)
- Active filter chips with remove buttons
- Sidebar filters: category radios, rating radios, price range slider
- Mobile: filters in slide-in drawer with overlay
- Sort select: Highest Rated / Price / Newest
- Skeleton loading state while fetching
- Empty state with reset button

### `ProviderProfileComponent`
- Gradient cover photo area
- Avatar, name, tagline, stats row
- Tab switcher: Portfolio | Services & Pricing | Reviews
- Gallery masonry grid with hover overlay
- Services table: name, description, duration, price, book button
- Reviews with avatar, stars, date, service tag
- Sidebar: About, Availability calendar, Sticky Book CTA

### `BookingComponent`
- Step indicator: Service → Date & Time → Details → Confirm
- Step 1: Service cards (select one)
- Step 2: Date picker + available time slot grid
- Step 3: Name, email, phone, notes form
- Step 4: Summary table + total + confirm button
- Right sidebar: Provider preview, selected service/time, trust badges
- Success state with booking reference

### `LoginComponent`
- Split layout: visual left panel + form right panel
- Google OAuth button (or email/password)
- Password show/hide toggle
- Error banner

### `RegisterComponent`
- Role toggle: Client | Artist (changes left panel content)
- Same form fields + terms checkbox
- Role sent to API for account creation

### `ClientDashboardComponent`
- Booking stats row (total, upcoming, completed)
- Tab: Upcoming | Past
- Booking cards with provider name, service, date, status badge, actions

### `ProviderDashboardComponent`
- Tab: Overview | Bookings | Portfolio | Settings
- Overview: stats row + recent bookings + growth tips
- Bookings: full list with confirm/decline actions
- Portfolio: image upload grid with remove button (Cloudinary)
- Settings: bio, category, location, Instagram, availability hours per day

---

## 6. Services Reference

### `ApiService` *(new — replaces Firebase)*
```typescript
// src/app/core/services/api.service.ts
// Base HTTP service that attaches JWT to every request

get<T>(path: string): Observable<T>
post<T>(path: string, body: any): Observable<T>
put<T>(path: string, body: any): Observable<T>
delete<T>(path: string): Observable<T>
```

### `AuthService`
```typescript
currentUser: Signal<UserProfile | null>
isLoading: Signal<boolean>
isAuthenticated: boolean
isProvider: boolean

register(email, password, name, role): Promise<void>
login(email, password): Promise<void>
loginWithGoogle(): Promise<void>
logout(): void
```
- Stores JWT in `localStorage`
- Decodes JWT payload to populate `currentUser` signal

### `ProviderService`
```typescript
getFeaturedProviders(): Observable<Provider[]>
searchProviders(filters: SearchFilters): Observable<Provider[]>
getProviderById(id: string): Observable<Provider>
createProvider(data: Partial<Provider>): Observable<Provider>
updateProvider(id: string, data: Partial<Provider>): Observable<Provider>
getReviews(providerId: string): Observable<Review[]>
```

### `BookingService`
```typescript
getClientBookings(): Observable<Booking[]>
getProviderBookings(): Observable<Booking[]>
createBooking(data: Omit<Booking, 'id'>): Observable<Booking>
updateBookingStatus(id: string, status: BookingStatus): Observable<void>
cancelBooking(id: string): Observable<void>
generateTimeSlots(open, close, duration): string[]
```

### `UploadService`
```typescript
uploadProviderImage(file: File, folder: 'profile'|'gallery'): Observable<string>
// Returns Cloudinary URL
```

---

## 7. MySQL Database Schema

### Install and run migration
```bash
mysql -u root -p < backend/migrations/001_initial_schema.sql
```

### Full Schema

```sql
-- ============================================================
-- MyBraids MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS mybraids
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mybraids;

-- ────────────────────────────────────────────────────────────
-- Users
-- ────────────────────────────────────────────────────────────
CREATE TABLE users (
  id           VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  email        VARCHAR(255) NOT NULL UNIQUE,
  password     VARCHAR(255),                          -- NULL for OAuth users
  display_name VARCHAR(150) NOT NULL,
  photo_url    VARCHAR(500),
  role         ENUM('client','provider','admin') NOT NULL DEFAULT 'client',
  phone        VARCHAR(30),
  location     VARCHAR(200),
  google_id    VARCHAR(100) UNIQUE,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ────────────────────────────────────────────────────────────
-- Providers
-- ────────────────────────────────────────────────────────────
CREATE TABLE providers (
  id                VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  user_id           VARCHAR(36)  NOT NULL UNIQUE,
  name              VARCHAR(150) NOT NULL,
  bio               TEXT,
  tagline           VARCHAR(255),
  category          ENUM('hair','makeup','eyelashes','nails','skincare') NOT NULL,
  profile_image     VARCHAR(500),
  rating            DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  review_count      INT          NOT NULL DEFAULT 0,
  starting_price    DECIMAL(10,2),
  currency          VARCHAR(10)  NOT NULL DEFAULT 'USD',
  verified          BOOLEAN      NOT NULL DEFAULT FALSE,
  featured          BOOLEAN      NOT NULL DEFAULT FALSE,
  years_experience  INT          NOT NULL DEFAULT 0,
  instagram         VARCHAR(100),
  city              VARCHAR(100),
  state             VARCHAR(100),
  country           VARCHAR(100),
  address           VARCHAR(255),
  lat               DECIMAL(10,7),
  lng               DECIMAL(10,7),
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_category (category),
  INDEX idx_country  (country),
  INDEX idx_city     (city),
  INDEX idx_rating   (rating DESC),
  INDEX idx_featured (featured)
);

-- ────────────────────────────────────────────────────────────
-- Provider Specialties
-- ────────────────────────────────────────────────────────────
CREATE TABLE provider_specialties (
  id          INT         AUTO_INCREMENT PRIMARY KEY,
  provider_id VARCHAR(36) NOT NULL,
  specialty   VARCHAR(100) NOT NULL,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_specialty (provider_id, specialty)
);

-- ────────────────────────────────────────────────────────────
-- Provider Gallery Images
-- ────────────────────────────────────────────────────────────
CREATE TABLE gallery_images (
  id           INT          AUTO_INCREMENT PRIMARY KEY,
  provider_id  VARCHAR(36)  NOT NULL,
  image_url    VARCHAR(500) NOT NULL,
  cloudinary_id VARCHAR(200),
  sort_order   INT          NOT NULL DEFAULT 0,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);

-- ────────────────────────────────────────────────────────────
-- Provider Services (menu of bookable items)
-- ────────────────────────────────────────────────────────────
CREATE TABLE provider_services (
  id          VARCHAR(36)   PRIMARY KEY DEFAULT (UUID()),
  provider_id VARCHAR(36)   NOT NULL,
  name        VARCHAR(150)  NOT NULL,
  description TEXT,
  duration    INT           NOT NULL COMMENT 'minutes',
  price       DECIMAL(10,2) NOT NULL,
  currency    VARCHAR(10)   NOT NULL DEFAULT 'USD',
  active      BOOLEAN       NOT NULL DEFAULT TRUE,
  sort_order  INT           NOT NULL DEFAULT 0,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);

-- ────────────────────────────────────────────────────────────
-- Provider Availability (per weekday)
-- ────────────────────────────────────────────────────────────
CREATE TABLE provider_availability (
  id          INT  AUTO_INCREMENT PRIMARY KEY,
  provider_id VARCHAR(36) NOT NULL,
  day_of_week ENUM('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  open_time   TIME,
  close_time  TIME,
  available   BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_day (provider_id, day_of_week)
);

-- ────────────────────────────────────────────────────────────
-- Bookings
-- ────────────────────────────────────────────────────────────
CREATE TABLE bookings (
  id            VARCHAR(36)   PRIMARY KEY DEFAULT (UUID()),
  client_id     VARCHAR(36)   NOT NULL,
  provider_id   VARCHAR(36)   NOT NULL,
  service_id    VARCHAR(36)   NOT NULL,
  service_name  VARCHAR(150)  NOT NULL,   -- snapshot at booking time
  service_price DECIMAL(10,2) NOT NULL,
  currency      VARCHAR(10)   NOT NULL DEFAULT 'USD',
  booking_date  DATE          NOT NULL,
  booking_time  TIME          NOT NULL,
  duration      INT           NOT NULL COMMENT 'minutes',
  status        ENUM('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
  notes         TEXT,
  client_name   VARCHAR(150)  NOT NULL,
  client_email  VARCHAR(255)  NOT NULL,
  client_phone  VARCHAR(30),
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id)   REFERENCES users(id),
  FOREIGN KEY (provider_id) REFERENCES providers(id),
  FOREIGN KEY (service_id)  REFERENCES provider_services(id),
  INDEX idx_client   (client_id),
  INDEX idx_provider (provider_id),
  INDEX idx_date     (booking_date),
  INDEX idx_status   (status)
);

-- ────────────────────────────────────────────────────────────
-- Reviews
-- ────────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id               VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  provider_id      VARCHAR(36) NOT NULL,
  client_id        VARCHAR(36) NOT NULL,
  booking_id       VARCHAR(36) UNIQUE,     -- one review per booking
  rating           TINYINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment          TEXT,
  service_provided VARCHAR(150),
  created_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id)   REFERENCES users(id),
  FOREIGN KEY (booking_id)  REFERENCES bookings(id)
);

-- ────────────────────────────────────────────────────────────
-- Trigger: keep providers.rating and review_count in sync
-- ────────────────────────────────────────────────────────────
DELIMITER $$

CREATE TRIGGER after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
  UPDATE providers
  SET rating       = (SELECT ROUND(AVG(rating), 2) FROM reviews WHERE provider_id = NEW.provider_id),
      review_count = (SELECT COUNT(*)               FROM reviews WHERE provider_id = NEW.provider_id)
  WHERE id = NEW.provider_id;
END$$

DELIMITER ;
```

---

## 8. Node.js / Express Backend API

### `backend/package.json`
```json
{
  "name": "mybraids-api",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cloudinary": "^2.2.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "multer-storage-cloudinary": "^4.0.0",
    "mysql2": "^3.9.7"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

### `backend/src/config/db.js`
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT || 3306,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false
});

module.exports = pool;
```

### `backend/src/server.js`
```javascript
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes     = require('./routes/auth.routes');
const providerRoutes = require('./routes/provider.routes');
const bookingRoutes  = require('./routes/booking.routes');
const reviewRoutes   = require('./routes/review.routes');
const uploadRoutes   = require('./routes/upload.routes');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.use('/api/auth',      authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings',  bookingRoutes);
app.use('/api/reviews',   reviewRoutes);
app.use('/api/upload',    uploadRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MyBraids API running on port ${PORT}`));
```

### `backend/src/middleware/auth.middleware.js`
```javascript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

### `backend/src/controllers/auth.controller.js`
```javascript
const db     = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { v4: uuid } = require('uuid');

const sign = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.display_name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

exports.register = async (req, res) => {
  const { email, password, displayName, role = 'client' } = req.body;
  try {
    const hash = await bcrypt.hash(password, 12);
    const id   = uuid();
    await db.execute(
      'INSERT INTO users (id, email, password, display_name, role) VALUES (?,?,?,?,?)',
      [id, email, hash, displayName, role]
    );
    const [[user]] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    res.status(201).json({ token: sign(user), user });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const [[user]] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: sign(user), user });
};

exports.me = async (req, res) => {
  const [[user]] = await db.execute(
    'SELECT id, email, display_name, role, photo_url, phone, location FROM users WHERE id = ?',
    [req.user.id]
  );
  res.json(user);
};
```

### `backend/src/controllers/provider.controller.js`
```javascript
const db = require('../config/db');

exports.search = async (req, res) => {
  const { location, category, minRating, maxPrice, sortBy = 'rating' } = req.query;

  let sql = `
    SELECT p.*,
      GROUP_CONCAT(DISTINCT ps.specialty) AS specialties
    FROM providers p
    LEFT JOIN provider_specialties ps ON ps.provider_id = p.id
    WHERE 1=1
  `;
  const params = [];

  if (category) { sql += ' AND p.category = ?'; params.push(category); }
  if (minRating) { sql += ' AND p.rating >= ?'; params.push(minRating); }
  if (maxPrice)  { sql += ' AND p.starting_price <= ?'; params.push(maxPrice); }
  if (location)  {
    sql += ' AND (p.city LIKE ? OR p.country LIKE ? OR p.state LIKE ?)';
    const q = `%${location}%`;
    params.push(q, q, q);
  }

  sql += ' GROUP BY p.id';

  const orderMap = {
    rating:     'p.rating DESC',
    price_asc:  'p.starting_price ASC',
    price_desc: 'p.starting_price DESC',
    newest:     'p.created_at DESC',
  };
  sql += ` ORDER BY ${orderMap[sortBy] || 'p.rating DESC'}`;

  const [rows] = await db.execute(sql, params);
  res.json(rows.map(r => ({
    ...r,
    specialties: r.specialties ? r.specialties.split(',') : []
  })));
};

exports.getFeatured = async (req, res) => {
  const [rows] = await db.execute(`
    SELECT p.*, GROUP_CONCAT(DISTINCT ps.specialty) AS specialties
    FROM providers p
    LEFT JOIN provider_specialties ps ON ps.provider_id = p.id
    WHERE p.featured = TRUE
    GROUP BY p.id
    ORDER BY p.rating DESC
    LIMIT 6
  `);
  res.json(rows);
};

exports.getById = async (req, res) => {
  const { id } = req.params;
  const [[provider]] = await db.execute('SELECT * FROM providers WHERE id = ?', [id]);
  if (!provider) return res.status(404).json({ error: 'Provider not found' });

  const [specialties] = await db.execute(
    'SELECT specialty FROM provider_specialties WHERE provider_id = ?', [id]
  );
  const [services]    = await db.execute(
    'SELECT * FROM provider_services WHERE provider_id = ? AND active = TRUE ORDER BY sort_order', [id]
  );
  const [gallery]     = await db.execute(
    'SELECT * FROM gallery_images WHERE provider_id = ? ORDER BY sort_order', [id]
  );
  const [availability] = await db.execute(
    'SELECT * FROM provider_availability WHERE provider_id = ?', [id]
  );

  res.json({
    ...provider,
    specialties:  specialties.map(s => s.specialty),
    services,
    galleryImages: gallery.map(g => g.image_url),
    availability:  availability.reduce((acc, row) => {
      acc[row.day_of_week] = {
        open: row.open_time, close: row.close_time, available: !!row.available
      };
      return acc;
    }, {})
  });
};

exports.upsertProfile = async (req, res) => {
  // Provider creating or updating their own profile
  // req.user.id comes from JWT middleware
};
```

---

## 9. REST API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/api/auth/register` | No | Register (body: `email, password, displayName, role`) |
| POST | `/api/auth/login` | No | Login → returns `{ token, user }` |
| GET | `/api/auth/me` | JWT | Get current user profile |
| PUT | `/api/auth/me` | JWT | Update profile (phone, location, photo) |

### Providers
| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/api/providers?location=Lagos&category=hair&minRating=4&sortBy=rating` | No | Search providers |
| GET | `/api/providers/featured` | No | Get 6 featured providers |
| GET | `/api/providers/:id` | No | Full provider profile with services, gallery, availability |
| POST | `/api/providers` | JWT (provider) | Create provider profile |
| PUT | `/api/providers/:id` | JWT (owner) | Update provider profile |
| POST | `/api/providers/:id/specialties` | JWT (owner) | Set specialties array |
| POST | `/api/providers/:id/services` | JWT (owner) | Add a service |
| PUT | `/api/providers/:id/services/:serviceId` | JWT (owner) | Update a service |
| DELETE | `/api/providers/:id/services/:serviceId` | JWT (owner) | Remove a service |
| PUT | `/api/providers/:id/availability` | JWT (owner) | Set full weekly availability |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/api/bookings` | JWT (client) | Create booking |
| GET | `/api/bookings/mine` | JWT (client) | Get my bookings |
| GET | `/api/bookings/provider` | JWT (provider) | Get bookings for my provider profile |
| PATCH | `/api/bookings/:id/status` | JWT | Update status (`confirmed`, `cancelled`, `completed`) |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/api/reviews/provider/:providerId` | No | Get reviews for a provider |
| POST | `/api/reviews` | JWT (client) | Leave a review (requires completed booking) |

### Upload
| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/api/upload/profile` | JWT (provider) | Upload profile image → returns Cloudinary URL |
| POST | `/api/upload/gallery` | JWT (provider) | Upload gallery image → returns Cloudinary URL |
| DELETE | `/api/upload/gallery/:cloudinaryId` | JWT (owner) | Delete gallery image from Cloudinary |

---

## 10. Authentication (JWT)

### Flow
```
Client                         API
  │── POST /api/auth/login ──► │
  │                            │ verify password with bcrypt
  │◄── { token, user } ────── │
  │                            │
  │── GET /api/providers  ───► │ (no auth needed)
  │── POST /api/bookings  ───► │ Authorization: Bearer <token>
  │                            │ middleware verifies JWT
  │◄── booking created ─────── │
```

### Angular `ApiService` with JWT
```typescript
// src/app/core/services/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  private headers(): HttpHeaders {
    const token = localStorage.getItem('mb_token');
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.base}${path}`, { headers: this.headers() });
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.base}${path}`, body, { headers: this.headers() });
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.base}${path}`, body, { headers: this.headers() });
  }

  patch<T>(path: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.base}${path}`, body, { headers: this.headers() });
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.base}${path}`, { headers: this.headers() });
  }
}
```

### Angular `AuthService` (JWT version)
```typescript
// src/app/core/services/auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UserProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api    = inject(ApiService);
  private router = inject(Router);

  currentUser = signal<UserProfile | null>(this.loadUser());
  isLoading   = signal(false);

  private loadUser(): UserProfile | null {
    const raw = localStorage.getItem('mb_user');
    return raw ? JSON.parse(raw) : null;
  }

  get isAuthenticated() { return !!this.currentUser(); }
  get isProvider()      { return this.currentUser()?.role === 'provider'; }

  register(email: string, password: string, displayName: string, role = 'client') {
    return this.api.post<{ token: string; user: UserProfile }>(
      '/auth/register', { email, password, displayName, role }
    ).pipe(tap(({ token, user }) => this.saveSession(token, user)));
  }

  login(email: string, password: string) {
    return this.api.post<{ token: string; user: UserProfile }>(
      '/auth/login', { email, password }
    ).pipe(tap(({ token, user }) => this.saveSession(token, user)));
  }

  private saveSession(token: string, user: UserProfile) {
    localStorage.setItem('mb_token', token);
    localStorage.setItem('mb_user', JSON.stringify(user));
    this.currentUser.set(user);
    this.router.navigate(user.role === 'provider' ? ['/dashboard/provider'] : ['/']);
  }

  logout() {
    localStorage.removeItem('mb_token');
    localStorage.removeItem('mb_user');
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }
}
```

---

## 11. File Upload (Cloudinary Free)

Cloudinary free tier: **25 GB storage · 25 GB bandwidth/month** — enough for a live marketplace.

### Setup
1. Sign up at [cloudinary.com](https://cloudinary.com) — free forever plan
2. Get your `cloud_name`, `api_key`, `api_secret` from the dashboard

### `backend/src/middleware/upload.middleware.js`
```javascript
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: `mybraids/${req.user.id}/${req.uploadFolder || 'gallery'}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
  }),
});

module.exports = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
```

### `backend/src/routes/upload.routes.js`
```javascript
const router  = require('express').Router();
const auth    = require('../middleware/auth.middleware');
const upload  = require('../middleware/upload.middleware');
const cloudinary = require('cloudinary').v2;

router.post('/profile', auth, (req, res, next) => {
  req.uploadFolder = 'profile';
  next();
}, upload.single('image'), (req, res) => {
  res.json({ url: req.file.path, cloudinaryId: req.file.filename });
});

router.post('/gallery', auth, (req, res, next) => {
  req.uploadFolder = 'gallery';
  next();
}, upload.single('image'), (req, res) => {
  res.json({ url: req.file.path, cloudinaryId: req.file.filename });
});

router.delete('/gallery/:id', auth, async (req, res) => {
  await cloudinary.uploader.destroy(req.params.id);
  res.json({ success: true });
});

module.exports = router;
```

---

## 12. Design System

### Colour Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#C85A2E` | Terracotta — CTAs, accents, links |
| `--primary-dark` | `#A0441E` | Hover state |
| `--primary-pale` | `#FDF0EA` | Backgrounds, tags |
| `--secondary` | `#E8A030` | Golden Amber — stars, badges, highlights |
| `--secondary-dark` | `#C07820` | Hover/text state |
| `--secondary-pale` | `#FEF8EC` | Warm backgrounds |
| `--sage` | `#4A7C59` | African Sage — success, verified |
| `--dark` | `#1C0A00` | Deep Espresso — hero bg |
| `--dark-2` | `#2D1B0E` | Body text, headings |
| `--light-bg` | `#FDF8F2` | Page background |
| `--border` | `#E8D5C0` | Card borders |
| `--text-muted` | `#8B6B52` | Secondary text |

### Typography
| Role | Font | Weight |
|------|------|--------|
| Display headings (h1–h3) | Playfair Display | 700, 800 |
| Italic accents | Playfair Display Italic | 400, 600 |
| Body text | DM Sans | 400, 500 |
| Labels & nav | DM Sans | 600, 700 |

### African Motifs
- **Kente strip** — repeating colour bar used as section divider and footer top
- **Diagonal pattern** — subtle 45° repeating gradient on hero and dark sections
- **Gradient avatars** — warm earth-tone gradients replace placeholder photos
- **Terracotta + Gold** — primary palette references West African textiles

---

## 13. Environment Configuration

### Angular — `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### Angular — `src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.railway.app/api'
};
```

### Backend — `backend/.env`
```env
# Server
PORT=3000
FRONTEND_URL=http://localhost:4200

# MySQL
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=mybraids
DB_SSL=false

# JWT
JWT_SECRET=a_very_long_random_string_at_least_64_chars

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 14. Free Hosting Options

### MySQL Database (pick one)
| Provider | Free Tier | Notes |
|----------|-----------|-------|
| **Aiven** | 1 service free forever | Hosted MySQL, TLS included |
| **db4free.net** | 200 MB free | Simple, good for prototyping |
| **Railway** | $5 free credits/mo | MySQL + app on same platform |
| **Clever Cloud** | Free small MySQL | EU-hosted |
| **Supabase** | Free PostgreSQL | Not MySQL but very similar SQL |

### Backend API
| Provider | Free Tier | Notes |
|----------|-----------|-------|
| **Railway** | $5/mo credit | Auto-deploys from GitHub |
| **Render** | 750 hrs/mo free | Spins down after inactivity |
| **Fly.io** | Free VM | Stays running, more setup |
| **Vercel** | Free (serverless) | Works with Express via adapter |

### Frontend (Angular)
| Provider | Free Tier | Notes |
|----------|-----------|-------|
| **Netlify** | Free unlimited | Best DX, instant deploys |
| **Vercel** | Free | Fast CDN |
| **Firebase Hosting** | Free (Spark plan) | Hosting only, no database needed |
| **GitHub Pages** | Free | Static, needs `base href` config |

### File Storage
| Provider | Free Tier | Notes |
|----------|-----------|-------|
| **Cloudinary** | 25 GB storage + 25 GB bandwidth | Recommended — easy to use |
| **ImageKit** | 20 GB/mo bandwidth | Good alternative |

---

## 15. Setup & Run Locally

### Prerequisites
- Node.js ≥ 18
- MySQL 8 running locally (or a free cloud DB)
- Angular CLI: `npm install -g @angular/cli`

### 1. Clone and install

```bash
git clone https://github.com/yourname/mybraids.git
cd mybraids

# Frontend deps
npm install

# Backend deps
cd backend && npm install && cd ..
```

### 2. Set up MySQL

```bash
# Create DB and run schema
mysql -u root -p < backend/migrations/001_initial_schema.sql
```

### 3. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# → fill in DB credentials, JWT_SECRET, Cloudinary keys

# Frontend (already points to localhost:3000 in dev mode)
```

### 4. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# → API running at http://localhost:3000

# Terminal 2 — Frontend
npm start
# → App running at http://localhost:4200
```

---

## 16. Deployment Guide

### Step 1 — Deploy MySQL on Aiven (free)
1. Go to [aiven.io](https://aiven.io) → Create free account
2. New Service → MySQL → Free plan → Pick region
3. Copy host, port, user, password, database into backend `.env`
4. Set `DB_SSL=true`
5. Run schema: `mysql -h HOST -P PORT -u USER -p mybraids < migrations/001_initial_schema.sql`

### Step 2 — Deploy Backend on Railway
```bash
cd backend
railway init
railway up
# Set environment variables in Railway dashboard
# Copy the deployed URL e.g. https://mybraids-api.railway.app
```

### Step 3 — Update Angular prod environment
```typescript
// src/environments/environment.prod.ts
apiUrl: 'https://mybraids-api.railway.app/api'
```

### Step 4 — Build & Deploy Frontend on Netlify
```bash
# Build
npm run build

# Deploy
# Option A: Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir dist/mybraids/browser

# Option B: Netlify dashboard
# Drag-drop the dist/mybraids/browser folder at app.netlify.com
```

Add a `_redirects` file in `src/` (copied to dist by adding to `assets` in angular.json):
```
/*  /index.html  200
```

### Step 5 — Enable Google OAuth (optional)
- Create OAuth 2.0 credentials in Google Cloud Console
- Add your Railway API URL to the authorised origins
- The backend handles the Google token exchange via `passport-google-oauth20`

---

*MyBraids — Built with Angular 17, Node.js, MySQL · African beauty, global reach.*
