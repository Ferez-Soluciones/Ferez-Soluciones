# Vertex Studio — Landing Page

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
  `email.service`. The lead is stored first; a failed notification is logged and
  swallowed, because losing a real lead over an email problem would be worse than
  a missing notification.

### Why no database

The site holds 24 content records that change every few months. Postgres or
SQLite here would be infrastructure to run, back up and deploy with nothing in
return, so the repositories read JSON files instead.

This does not weaken the architecture: the repository layer exists with the same
interfaces (`repositories/contracts.ts`), and only the adapters know about the
filesystem. Swapping in a real database means writing new adapters and
re-pointing the six lines in `repositories/index.ts` — services, controllers and
routes stay untouched.

`repositories/json-store.ts` handles the parts of file storage that are easy to
get wrong: content is parsed once and cached, `leads.json` is written with a
temp-file-plus-rename so a crash cannot truncate it, and writes are queued so two
simultaneous submissions cannot overwrite each other.

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
(`CONTACT_RATE_LIMIT_MAX`), because it is public and writes to disk.

---

## Content

| File | Section |
|---|---|
| `server/src/data/services.json` | Servicios |
| `server/src/data/projects.json` | Portfolio |
| `server/src/data/testimonials.json` | Testimonios |
| `server/src/data/faqs.json` | FAQ |
| `server/src/data/stats.json` | Métricas |
| `server/src/data/leads.json` | Contact submissions (runtime, git-ignored) |

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
| `EMAIL_TRANSPORT` | `console` | `console` logs the email instead of sending it |
| `CONTACT_TO` / `CONTACT_FROM` | `contacto.mfsoluciones@gmail.com` | Notification addresses |
| `CONTACT_RATE_LIMIT_MAX` | `5` | Submissions per IP per window |
| `CONTACT_RATE_LIMIT_WINDOW_MS` | `3600000` | Window length (1 hour) |

To send real email, add a transport to `resolveTransport()` in
`server/src/services/email.service.ts`. It only has to expose `name` and `send`;
nothing else in the codebase changes.

---

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | API and Vite dev server together |
| `npm run dev:server` / `npm run dev:client` | One at a time |
| `npm run build` | Compiles the server and bundles the client |
| `npm start` | Runs the production build on a single port |
| `npm run typecheck` | Type-checks both workspaces |

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

## `legacy/`

The original static site (`index.html`, `styles/main.css`, `js/app.js`) is kept
there as the visual reference for this rebuild. Delete the folder once you have
compared the two side by side — the files also remain in git history.
