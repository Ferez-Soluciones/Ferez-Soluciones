# Ferez Soluciones — Landing Page

High-conversion landing page for a web design studio, rebuilt as a **Node.js + React**
monorepo with a strict layered architecture.

The page is in Spanish (it is the studio's commercial copy for an Argentine
audience); the code — files, identifiers, comments, logs and this README — is in
English.

---

## Quick start

```bash
npm install
npm run dev
```

- API → <http://localhost:4000>
- UI  → <http://localhost:5173> (Vite proxies `/api` to the API)

No `.env` and no database are required. Every setting has a default, and the
content lives in JSON files inside the repository.

### Production

```bash
npm run build
npm start          # single port: Express serves both the API and client/dist
```

---

## Architecture

Requests flow strictly in one direction. Each layer knows only the one below it.

```
Browser  →  index.ts  →  routes  →  controllers  →  services  →  repositories  →  JSON files
                                         ↑              ↓
                                    middlewares    email.service
```

| Layer | Location | Does | Must never |
|---|---|---|---|
| **Entry point** | `server/src/index.ts` | Starts and stops the HTTP server | Contain logic |
| **App setup** | `server/src/app.ts` | Middlewares, routes, static files | Bind a port |
| **Routes** | `server/src/routes/` | Map URLs to handlers | Import services |
| **Controllers** | `server/src/controllers/` | Parse the request, shape the response | Import repositories, hold business rules |
| **Services** | `server/src/services/` | Business rules and orchestration | Touch `req`/`res` or the filesystem |
| **Repositories** | `server/src/repositories/` | Read and write data | Apply business rules |
| **Domain** | `server/src/domain/` | Entities and DTOs | Depend on anything |

Two examples of why the boundaries are drawn where they are:

- **Portfolio filtering** lives in `services/project.service.ts`, not in the
  controller (which only reads the query string) and not in the repository
  (which only knows how to fetch records).
- **Contact submission** is the fan-out branch of the diagram:
  `contact.controller` → `contact.service` → `lead.repository` **and**
  `email.service`. What happens when the email fails depends on whether the lead
  was stored durably:
  - **Durable storage** (a server with a disk): the failure is logged and
    swallowed. Losing a real lead over an email problem would be worse than a
    missing notification.
  - **Ephemeral storage** (serverless): the email is the only copy, so the
    request is rejected with 502 and the visitor is pointed at WhatsApp.

  Note that "the email failed" is not the same as "sending threw". The console
  transport resolves without delivering anything, so `EmailTransport` declares
  `guaranteesDelivery` and the service checks that flag. Trusting the absence of
  an exception is exactly how a lead disappears in silence.

### Why no database

The site holds 24 content records that change every few months. Postgres or
SQLite here would be infrastructure to run, back up and deploy with nothing in
return, so the repositories read JSON files instead.

This does not weaken the architecture: the repository layer exists with the same
interfaces (`repositories/contracts.ts`), and only the adapters know about the
filesystem. Swapping in a real database means writing new adapters and
re-pointing the six lines in `repositories/index.ts` — services, controllers and
routes stay untouched.

Content is `import`ed as a module rather than read with `fs`, so the bundler
inlines it and the same code works on a serverless host with no readable disk.
`repositories/json-store.ts` therefore handles only writable state — the leads —
and handles the parts that are easy to get wrong: the file is written with a
temp-file-plus-rename so a crash cannot truncate it, and writes are queued so two
simultaneous submissions cannot overwrite each other.

Runtime state lives in `server/data/`, deliberately outside both `src/` (which
holds committed content) and `dist/` (which the build deletes).

---

## API

| Method | Route | Returns |
|---|---|---|
| GET | `/api/health` | Liveness probe |
| GET | `/api/services` | The 6 service cards |
| GET | `/api/projects?category=<slug>` | Portfolio, optionally filtered |
| GET | `/api/projects/categories` | The filter buttons, derived from the projects |
| GET | `/api/testimonials` | The 3 client quotes |
| GET | `/api/faqs` | The 5 FAQ entries |
| GET | `/api/stats` | The 4 animated metrics |
| POST | `/api/contact` | Stores a lead and notifies the studio |

Responses always use the same envelope:

```jsonc
{ "success": true,  "data": … }
{ "success": false, "error": { "message": "…", "code": "…", "fields": { "email": "…" } } }
```

`POST /api/contact` is rate limited to 5 submissions per IP per hour
(`CONTACT_RATE_LIMIT_MAX`), because it is public and does real work. The counter
is per process: a genuine hourly limit on a long-running server, and only a
burst brake on serverless, where each cold start begins with an empty counter.

---

## Content

| File | Section |
|---|---|
| `server/src/data/services.json` | Servicios |
| `server/src/data/projects.json` | Portfolio |
| `server/src/data/testimonials.json` | Testimonios |
| `server/src/data/faqs.json` | FAQ |
| `server/src/data/stats.json` | Métricas |

Contact submissions are **not** content: they are written at runtime to
`server/data/leads.json`, which is git-ignored and created on first use.

Keys are English, values are the Spanish copy shown to visitors. Every record
carries an `order` field, so reordering a section is a JSON edit.

Content that only changes when the brand changes — the hero, the four process
steps, contact details, the footer — is a typed constant in
`client/src/content/site.ts` instead. Routing it through the API would put a
loading state in front of the first thing a visitor sees.

---

## Client

React 18 + Vite + TypeScript. No router (one document, anchor navigation), no
state library, no CSS framework.

Each `initX()` function of the original `js/app.js` became a single-purpose hook:

| Legacy function | Hook |
|---|---|
| `initNavToggle` | state in `components/layout/Header.tsx` + `useMediaQuery` |
| `initStickyHeader` | `useStickyHeader` |
| `initScrollSpy` | `useScrollSpy` |
| `initReveal` | `useReveal` (one shared IntersectionObserver, staggered) |
| `initCounters` | `useCountUp` |
| `initPortfolioFilters` | `components/sections/Portfolio.tsx` (now refetches from the API) |
| `initAccordion` | `components/sections/Faq.tsx` |
| `initContactForm` | `components/sections/Contact.tsx` + `lib/validators.ts` |
| `initFooterYear` | computed at render in `components/layout/Footer.tsx` |

### Styles

`client/src/styles/` is the original stylesheet split into one file per BEM
block, imported in order from `main.css`. Class names, `:root` tokens and the
Mobile-First breakpoints (600 / 900 / 1120 px) are unchanged, so the rebuilt page
renders like the original.

### Validation

The three contact rules exist twice: in `client/src/lib/validators.ts` for
instant feedback on blur, and in `server/src/domain/dto/contact.dto.ts` as the
zod schema that actually decides. The client copy is UX; the server is the
authority and returns per-field messages the form renders inline.

---

## Environment variables

All optional — see `.env.example`.

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | API port |
| `NODE_ENV` | `development` | Hides error details in production |
| `CLIENT_ORIGIN` | `http://localhost:5173` | CORS origin for the Vite dev server |
| `EMAIL_TRANSPORT` | `console` | `console` logs the email; `resend` sends it |
| `CONTACT_TO` | `ferezsoluciones@gmail.com` | Inbox that receives the leads |
| `CONTACT_FROM` | `onboarding@resend.dev` | Sender — must be a domain verified in Resend |
| `RESEND_API_KEY` | — | Required when `EMAIL_TRANSPORT=resend` |
| `CONTACT_RATE_LIMIT_MAX` | `5` | Submissions per IP per window |
| `CONTACT_RATE_LIMIT_WINDOW_MS` | `3600000` | Window length (1 hour) |
| `SERVERLESS` | — | Set to `1` to reproduce the serverless path locally |

To use another email provider, add a transport to `resolveTransport()` in
`server/src/services/email.service.ts`. It only has to expose `name` and `send`;
nothing else in the codebase changes.

---

## Deploying to Vercel

`vercel.json` builds the client and exposes the Express app as a single function:

```jsonc
{
  "buildCommand": "npm run build --workspace client",  // → client/dist
  "outputDirectory": "client/dist",                    // the static site
  "installCommand": "npm install",                     // installs both workspaces
  "functions": { "api/index.ts": { "maxDuration": 30 } },
  "rewrites": [{ "source": "/api/(.*)", "destination": "/api" }]
}
```

No `framework` preset: the Vite project lives in `client/`, not at the repo root,
so declaring one at the root makes Vercel apply defaults built for a different
layout. `maxDuration` is raised because `POST /api/contact` makes an outbound
call to Resend, and the default ceiling is 10 seconds.

`api/index.ts` is the serverless entry point. It reuses `createApp()` untouched —
which is why app assembly and process startup were split into two modules in the
first place: `server/src/index.ts` binds a port, `api/index.ts` hands the same app
to Vercel.

It also normalises `req.url` to start with `/api` before Express sees it. Whether
a rewritten request arrives with its original path or the destination path is not
something this codebase should bet on: if the prefix were dropped, every endpoint
would 404 in production while working perfectly in development.

**Set the Node version to 22.x in Project Settings → General.** `engines.node` is
a range here so local installs on newer Node do not warn, and a range is not a
form Vercel pins on.

Set these in **Project Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `EMAIL_TRANSPORT` | `resend` |
| `RESEND_API_KEY` | your key from <https://resend.com/api-keys> |
| `CONTACT_TO` | `ferezsoluciones@gmail.com` |
| `CONTACT_FROM` | `onboarding@resend.dev`, or an address on a domain you verified |

### What changes on serverless, and why

Vercel's filesystem is read-only and `/tmp` disappears with the instance, so
`leads.json` cannot work there. The layered design absorbs this in two places
and nowhere else:

- **Content** is imported rather than read with `fs`, so the bundler inlines it.
  Read-only data works identically on every host.
- **Leads** get a second adapter. `repositories/index.ts` picks
  `ephemeral/lead.repository.ts` when `VERCEL=1`, and it reports
  `isDurable: false`.

That flag is not cosmetic. `contact.service.ts` reads it to decide how to treat a
failed notification: with a real disk the lead is already safe and the error is
just logged, but on serverless **the email is the only copy of the lead**, so a
delivery failure returns 502 and tells the visitor to write directly. Answering
"¡Gracias!" while the message evaporates would be the worst outcome for a page
whose entire job is collecting these.

Crucially, this covers the *silent* case too. The `console` transport resolves
without sending anything, so on serverless it would otherwise report success
while the lead evaporated. `EmailTransport.guaranteesDelivery` is what the
service checks; a submission that can be neither stored nor delivered is refused
before it is accepted, and the mismatch is logged loudly at boot.

To exercise that path locally:

```bash
SERVERLESS=1 EMAIL_TRANSPORT=console npm run dev:server   # every POST → 502, by design
```

---

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | API and Vite dev server together |
| `npm run dev:server` / `npm run dev:client` | One at a time |
| `npm run build` | Compiles the server and bundles the client |
| `npm start` | Runs the production build on a single port |
| `npm run typecheck` | Type-checks `server`, `client` **and** the `api/` function |
| `npm run lint` | ESLint, with the rules of hooks as errors |

---

## Accessibility

Carried over from the original and verified to still hold: skip link as the first
focusable element, `aria-expanded`/`aria-controls` on the menu toggle and the
accordion, `aria-pressed` on the portfolio filters, `aria-live` on the project
grid, `role="alert"` on form errors, `role="status"` on the success message,
decorative SVGs hidden from assistive tech, and a single `h1` with a clean
`h2`/`h3` hierarchy.

`prefers-reduced-motion` is honoured in both CSS and JavaScript: the count-up
animation and the scroll reveals are skipped entirely, not merely shortened.

---

## Known gaps

Found in review, deliberately not fixed yet:

- Body-parser failures (malformed JSON, oversized body) surface as 500 instead of
  400/413.
- The SPA fallback is `app.get('*')` only, so a non-GET request to an unknown
  path falls through to Express's HTML 404 instead of the JSON envelope.
- The business-category list is written out in five places (`entities.ts`,
  `contact.dto.ts`, `contact.service.ts`, `client/types/api.ts`,
  `client/content/site.ts`) and can drift without a compile error.
- `json-store` leaks a `.tmp` file if the atomic rename fails.
- Graceful shutdown has no timeout, so one hung connection blocks exit.
