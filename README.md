# Silent Shift — Full MVP

A Persian (RTL) podcast & narrative website with full backend, admin panel, and audio player.

## Stack

- **Next.js 15** (App Router) — frontend + API routes
- **React 18** + TypeScript
- **Tailwind CSS** for styling
- **SQLite** (`better-sqlite3`) — file-based, zero setup
- **Zod** for input validation
- **bcryptjs + jose (JWT)** for admin auth
- **Native HTML5 `<audio>`** as the player engine (light, no extra libs)
- **IRANYekanXFaNum** licensed local webfont (400/500/600/700, Persian numerals)

## 📌 Design assets

The supplied design assets are integrated into the application:

1. **IRANYekanXFaNum** local WOFF2 files in `public/fonts/`
2. **Apple Podcasts and Castbox** SVG marks in `public/brand/`
3. Optimized imagery extracted from the supplied desktop/mobile design SVGs in `public/design/`

The application no longer depends on Google Fonts at build or runtime. See **[`docs/ADDING_ASSETS.md`](docs/ADDING_ASSETS.md)** for the asset map and replacement guidance.

## Quick start

```bash
npm install
npm run seed        # populates the DB with sample data + bootstrap admin
npm run dev         # → http://localhost:3000
```

Development bootstrap credentials (used only when `NODE_ENV` is not production and no admin exists):
- Username: `admin`
- Password: `admin1234`
- Admin panel: http://localhost:3000/admin

Production startup refuses to create an administrator unless `ADMIN_USERNAME`, a 12+ character `ADMIN_PASSWORD`, and a 32+ character `AUTH_SECRET` are explicitly configured. The admin URL is intentionally not linked from the public website.

Other scripts:
- `npm run seed:force` — wipe and deterministically re-seed content while preserving admin/messages/subscribers
- `npm test` — core security, Markdown, and utility tests
- `npm run lint` — strict TypeScript validation
- `npm run build && npm start` — production build and validated startup

## Run with Docker

```bash
docker compose up -d --build
docker compose exec app npm run seed
```

`docker-compose.yml` requires production authentication variables and exits before startup when they are missing.

---

## 📄 Pages

### Public
| Route                | Description                                    |
| -------------------- | ---------------------------------------------- |
| `/`                  | Landing page (hero, latest episode, articles, FAQ) |
| `/podcasts`          | Podcast list (filter / sort / paginate)        |
| `/podcasts/[slug]`   | Single podcast (play, download, summary)       |
| `/articles`          | Article list (filter / sort / paginate)        |
| `/articles/[slug]`   | Single article + related podcasts              |
| `/about`             | About Barzoo (editable via admin)              |
| `/contact`           | Contact form                                   |
| `/faq`               | Full FAQ accordion                             |
| `/search?q=`         | Dedicated search results page                  |
| `/sitemap.xml`       | Dynamic sitemap                                |
| `/robots.txt`        | Robots directives                              |

### Admin
| Route                | Description                          |
| -------------------- | ------------------------------------ |
| `/admin/login`       | Login page                           |
| `/admin`             | Dashboard with stats                 |
| `/admin/podcasts`    | List, create, delete podcasts        |
| `/admin/articles`    | List, create, delete articles        |
| `/admin/messages`    | View contact messages & subscribers  |
| `/admin/content`     | Edit homepage / about / hero text    |

Admin routes are protected by middleware (JWT cookie). Non-authenticated users are redirected to `/admin/login`.

---

## 🌐 API

All responses are `{ ok: true, data }` or `{ ok: false, error }`.

### Public

| Method | Route                              | Notes                                                            |
| ------ | ---------------------------------- | ---------------------------------------------------------------- |
| GET    | `/api/podcasts`                    | `?category=&sort=new\|popular&page=&limit=&q=`                   |
| GET    | `/api/podcasts/[slug]`             | Returns `{ podcast, related }`                                   |
| POST   | `/api/podcasts/[slug]/play`        | Increments `play_count` (rate-limited: 10/min/IP)                |
| GET    | `/api/articles`                    | Same query params as podcasts                                    |
| GET    | `/api/articles/[slug]?track=1`     | `track=1` increments `view_count`                                |
| GET    | `/api/categories`                  | All categories                                                   |
| GET    | `/api/faqs`                        | All FAQs                                                         |
| GET    | `/api/content`                     | All public site content (about, hero, etc.)                      |
| GET    | `/api/search?q=`                   | Cross-search podcasts + articles                                 |
| POST   | `/api/newsletter`                  | `{ email }` — rate-limited: 5/min/IP                             |
| POST   | `/api/contact`                     | `{ name, email, subject?, message }` — rate-limited: 5/10min/IP  |
| GET    | `/api/health`                      | Health check                                                     |

### Auth

| Method | Route                | Body                              |
| ------ | -------------------- | --------------------------------- |
| POST   | `/api/auth/login`    | `{ username, password }` — rate-limited: 5/min/IP |
| POST   | `/api/auth/logout`   | —                                 |
| GET    | `/api/auth/me`       | Returns current session info      |

### Admin (require admin JWT cookie)

| Method | Route                              | Body                                        |
| ------ | ---------------------------------- | ------------------------------------------- |
| GET    | `/api/admin/podcasts`              | List all podcasts                           |
| POST   | `/api/admin/podcasts`              | Create podcast                              |
| DELETE | `/api/admin/podcasts/[id]`         | Delete podcast                              |
| GET    | `/api/admin/articles`              | List all articles                           |
| POST   | `/api/admin/articles`              | Create article                              |
| DELETE | `/api/admin/articles/[id]`         | Delete article                              |
| GET    | `/api/admin/content`               | Get all site content                        |
| PUT    | `/api/admin/content`               | Update site content (key → value)           |
| GET    | `/api/admin/messages`              | Contact messages + newsletter subscribers   |
| POST   | `/api/uploads`                     | multipart `file` + `kind=cover\|audio`      |

---

## 🎵 Audio player

- **Engine**: native HTML5 `<audio>` element managed via a global React Context (`PlayerProvider`).
- **No external libraries** — keeps the bundle light.
- **Persistent across navigation** — single `<audio>` instance lives in the layout.
- **Two display modes**: collapsed pill (bottom) and expanded card with scrubber.
- **Features**: play/pause, ±10 s seek, click-to-seek progress bar, loading spinner, error state, downloadable audio.
- **Streaming-friendly**: Next.js serves `/public/*` with HTTP Range support, so the browser streams audio in chunks (no full preload). Confirmed with `curl -H "Range: bytes=0-1023"` → returns `206 Partial Content`.
- **Audio location**: drop files in `public/uploads/audio/` via the admin upload form, or paste any URL into the podcast's `audio_url` field.

---

## 🗄️ Database

SQLite file at `data/app.db`. Migrations live in `lib/db.ts` and run automatically on first connect; new migrations only run once thanks to the `_migrations` tracking table.

### Tables

| Table                    | Purpose                                  |
| ------------------------ | ---------------------------------------- |
| `categories`             | Topic categories                         |
| `podcasts`               | Podcast episodes + play_count            |
| `articles`               | روایت ها + view_count                    |
| `newsletter_subscribers` | Newsletter signups                       |
| `contact_messages`       | Contact form submissions                 |
| `faqs`                   | FAQ items                                |
| `site_content`           | Editable site copy (hero, about, etc.)   |
| `admins`                 | Admin accounts (bcrypt-hashed passwords) |
| `rate_limits`            | Fixed-window rate limit buckets          |
| `tags`                   | Reusable content tags                    |
| `podcast_tags` / `article_tags` | Tag relationships                |
| `chapters`               | Podcast timestamps                       |
| `_migrations`            | Applied migration IDs                    |

---

## 🔐 Security

- **Admin auth**: bcrypt password + JWT cookie (httpOnly, sameSite=lax, secure in prod, 8-hour expiry)
- **Edge middleware** protects all `/admin/*` routes (except login) at the request boundary
- **Rate limiting**: SQLite-backed fixed-window limiter on newsletter, contact, login, and play endpoints
- **Input validation**: Zod schemas on every POST/PUT body
- **Upload protection**: admin session, same-origin enforcement, canonical extensions, file-signature validation, size limits, storage quota, streamed writes, and orphan cleanup
- **Consistent backups**: SQLite backup API snapshots the main database and WAL safely
- **Security headers**: CSP, HSTS in production, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`
- **Admin isolation**: no public navigation link, `noindex` headers, robots exclusion, and URL-only access

### Required environment variables in production

```env
AUTH_SECRET=<random 32+ character string>     # JWT signing key
ADMIN_USERNAME=your-username
ADMIN_PASSWORD=your-strong-password              # 12+ characters
NEXT_PUBLIC_SITE_URL=https://example.com
TRUST_PROXY=true                                  # only behind a trusted proxy
# DATA_DIR=/data/db                               # persistent volume
# UPLOAD_DIR=/data/uploads                        # persistent volume
```

Railway and similar container platforms require a persistent volume. Mount it and set `DATA_DIR`/`UPLOAD_DIR`; `scripts/start.js` links the upload mount into `public/uploads` before starting Next.js.

---

## ♿ Accessibility

- Skip-to-main-content link
- All interactive icons have `aria-label`
- Focus-visible outlines on all controls
- ARIA roles on dialog (search modal, drawer), slider (player progress), and accordion (FAQ)
- Semantic landmarks: `<header>`, `<main>`, `<footer>`, `<nav>`, `<article>`

---

## 📁 Project structure

```
app/
  layout.tsx                          # RTL Persian shell + PlayerProvider
  page.tsx                            # Landing
  loading.tsx / error.tsx / not-found.tsx
  podcasts/, articles/                # Public pages (+ [slug])
  about/, contact/, faq/, search/     # New public pages
  admin/                              # Admin panel (protected)
  api/                                # All endpoints (public + auth + admin)
  sitemap.xml/, robots.txt/           # SEO

components/
  Header.tsx, Footer.tsx, Breadcrumb.tsx
  PodcastCard.tsx, ArticleCard.tsx, Cover.tsx
  SearchModal.tsx, FaqAccordion.tsx, SortFilter.tsx
  Newsletter.tsx, ShareButton.tsx, Pagination.tsx
  PlayButton.tsx
  player/                             # Global audio player (Context + UI)
  admin/                              # Admin-only widgets

lib/
  db.ts                               # SQLite + migrations
  auth.ts / auth-edge.ts              # Node + Edge-safe auth halves
  ratelimit.ts                        # SQLite-backed rate limiter
  http.ts                             # Response helpers
  utils.ts                            # slugify, formatDuration, formatPersianDate
  api-client.ts                       # Browser fetch wrapper
  types.ts
  seed.ts                             # Sample data + bootstrap admin
  repos/                              # All SQL queries (one file per entity)

middleware.ts                         # Admin auth + security headers
scripts/seed.ts                       # CLI: `npm run seed`
data/                                 # SQLite DB (gitignored)
public/uploads/                       # Uploaded files (gitignored)
public/audio-sample/sample.wav        # Demo audio for seeded podcasts
```

---

## ✅ What's complete

- [x] All 5 frontend pages wired to backend (no more placeholders)
- [x] Functional pagination, filter chips, and sort dropdown
- [x] Newsletter form with success/error feedback + rate limiting
- [x] Working contact form with validation
- [x] FAQ accordion fed from DB
- [x] Search modal (header icon) + dedicated /search page
- [x] Menu drawer with all nav links
- [x] About + Contact + FAQ pages
- [x] Real audio playback via global player context
- [x] Admin panel: dashboard, podcasts/articles CRUD, content editor, messages viewer
- [x] Admin auth: login, logout, middleware protection, bootstrap admin
- [x] Upload endpoint with admin auth, MIME/size validation
- [x] Rate limiting on newsletter, contact, login, play endpoints
- [x] Loading / error / 404 states
- [x] Security headers + httpOnly JWT cookie
- [x] sitemap.xml + robots.txt + Open Graph metadata
- [x] Accessibility (a11y) baseline: focus styles, ARIA, skip link
- [x] Migration system (multiple migrations supported)
- [x] Active-tab styling on filter chips
- [x] Real breadcrumbs (with links)
- [x] Persian date formatting (`Intl.DateTimeFormat`)
- [x] Duration formatting helper
- [x] Slug generator (handles Persian text)
- [x] Production-ready Docker setup (multi-stage, non-root, healthcheck)
- [x] Build passes cleanly with zero errors

## 🔜 Possible future work

- [ ] Real images & brand colors (currently grayscale by design)
- [ ] Audio "continue where you left off" (localStorage)
- [ ] Edit/update endpoints (currently only create + delete for admin)
- [ ] Multi-admin support / role management
- [ ] Email notifications (newsletter blast, contact form forwards)
- [ ] Postgres migration for scaling
- [ ] Cloud storage (S3 / Cloudinary) for uploads
- [ ] Vitest tests for repos + API routes
- [ ] i18n if you ever need English
