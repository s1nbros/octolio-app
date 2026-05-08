# Octolio — Project Context for Claude

## Project Overview
Octolio is a personal finance learning app (Duolingo-style) with:
- Interactive lessons and exercises on budgeting, investing, taxes, real estate, etc.
- Free tier + Pro subscription via Stripe
- AI Financial Advisor (Pro-only) powered by Claude Haiku

## Stack
- **Frontend**: React 18 + TypeScript + Vite, hosted on Render as static site
- **Backend**: Node.js + Express + TypeScript, compiled to `dist/` and committed for Render deployment
- **Database**: PostgreSQL on Neon, accessed via `pg`
- **Auth**: JWT tokens + email-verified registration (Resend)
- **Email**: Resend HTTP API (preferred) with SMTP fallback via `nodemailer`
- **AI**: Anthropic SDK v0.30.x — SSE streaming

## Project Structure
```
octolio-app/
  backend/
    src/
      data/
        lessons.ts              — all module/lesson data (static + generated merged)
        generated-modules.json  — 19 generated modules loaded at runtime
        banned-words.ts         — nickname blocklist + isNicknameBanned()
      services/
        email.ts                — Resend HTTP API (preferred) + SMTP fallback
        lessonGenerator.ts      — AI lesson generation
      routes/
        auth.ts                 — register/verify/resend/login/forgot/reset/me, etc.
        progress.ts             — lesson completion, energy deduction
        ai.ts                   — AI advisor SSE endpoint (Pro-only)
        stripe.ts               — Stripe checkout + webhook
      middleware/auth.ts        — JWT authenticate middleware
      db.ts                     — exports getPool()
    dist/                   — compiled output, committed to git for Render
    package.json            — build: "tsc && cp src/data/generated-modules.json dist/data/generated-modules.json"
  frontend/
    src/
      pages/
        Dashboard.tsx       — module overview with pro/free distinction
        Lesson.tsx          — exercise flow with hearts + energy
        AiAdvisor.tsx       — AI chat (Pro-only, SSE streaming)
        Modules.tsx         — module list
        Profile.tsx
        League.tsx
        Register.tsx        — debounced live availability hints (banned/taken)
        Login.tsx           — links to /forgot-password, surfaces "resend verification" inline
        VerifyEmail.tsx     — "Check your inbox" page; auto-verify via ?token=…, manual code form
        ForgotPassword.tsx  — request reset email
        ResetPassword.tsx   — set new password from emailed token
      components/
        Navbar.tsx          — energy pill (clickable popover), pro badge, nav tabs
        ExerciseRenderer.tsx — routes exercise.type to specialized components
        ModuleCard.tsx
        FloatingOrbs.tsx
        exercises/
          TheoryCard.tsx        — theory slides (swipeable pages)
          RPGScenario.tsx       — interactive RPG-style financial scenarios
          BudgetSlider.tsx      — budget allocation with sliders
          RatRaceGame.tsx       — rat race board game simulation
          CompoundSim.tsx       — compound interest simulator
          SortItems.tsx         — drag-to-sort into categories
          MatchTerms.tsx        — match terms to definitions
          OrderItems.tsx        — arrange items in correct order
          TrueFalse.tsx         — true/false statement evaluation
          ScenarioDecision.tsx  — multi-choice scenario with outcomes
          FillNumber.tsx        — numeric answer with tolerance range
      contexts/
        AuthContext.tsx      — user state, updateUser, refreshUser
        LanguageContext.tsx  — EN/BG
        ThemeContext.tsx
      types/index.ts         — User, Module, Lesson, Exercise types
```

## Authentication Flow

### Registration (email-verified, no row in `users` until verified)
1. `POST /api/auth/register` → row goes into **`pending_registrations`** table
   (`email`, `name`, `password_hash`, `verification_code`, `verification_token`,
   `expires_at`). The `users` table is **not touched** at this stage.
2. Backend sends a verification email (6-digit code + clickable `/verify-email?token=…`).
   The email send is **fire-and-forget** (`fireEmail()` helper) — never `await`-ed —
   so a slow/blocked SMTP can't hang the API response.
3. Frontend lands on `/verify-email`. User enters code OR clicks email link.
4. `POST /api/auth/verify-email` (accepts `{token}` or `{email, code}`):
   - Looks up `pending_registrations` row, checks expiry.
   - Inserts into `users` with `email_verified = TRUE`, deletes from `pending_registrations`,
     issues JWT, returns user.
5. `POST /api/auth/resend-verification` updates the pending row with a new code.

### Live availability hints (Register page)
- Public `GET /api/auth/check-availability?name=X&email=Y` returns
  `{ name: { available, banned }, email: { available } }`.
- Frontend debounces 350ms, shows green ✓ / red ✗ inline like the password rules.
- Submit button stays disabled until name + email + password are all ✓.
- Banned-word check runs on the server (`backend/src/data/banned-words.ts`) so the
  frontend list can't be bypassed. Comparison is normalised (lowercase + leetspeak →
  letters + non-letters stripped) so `N1gG3r_` is caught.

### Forgot / reset password
- `POST /api/auth/forgot-password` — issues 1h-TTL reset token, emails `/reset-password?token=…`.
  Always returns `{ok: true}` to avoid leaking which addresses exist.
- `POST /api/auth/reset-password { token, newPassword }` — validates + updates `users.password_hash`.
- Reset state lives on `users.password_reset_token` / `password_reset_expires_at`
  (separate from the verification flow on `pending_registrations`).

### Login
- Login looks up only the `users` table (verified accounts).
- An unverified registration → 403 `{ emailNotVerified: true, email }` so the
  Login page can offer "Resend verification email".

### Email service (`backend/src/services/email.ts`)
- **Prefers Resend HTTP API** (HTTPS port 443) — Render blocks outbound SMTP on
  ports 25/465/587. If `RESEND_API_KEY` is set, or `SMTP_HOST=smtp.resend.com`
  with an `re_…` `SMTP_PASS`, the service uses `https://api.resend.com/emails`.
- Falls back to SMTP via nodemailer (with 8s connect/socket timeouts) only if no
  Resend key is detected.
- Logs at startup: `[email] using Resend HTTP API (...)` or `[email] using SMTP: ...`
  or `[email] NOT configured`.
- When neither is configured, verification codes are returned in the API
  response as `devCode` and shown inline on `/verify-email` so dev flow isn't blocked.
- Diagnostic endpoint: `POST /api/auth/email-diag {token, to}` (guarded by
  `EMAIL_DEBUG_TOKEN` env var) — sends a test email and reports success/error,
  useful for verifying SMTP/API connectivity from a deployed environment.

### Required env vars (Render backend)
| var               | required             | purpose                                    |
|-------------------|----------------------|--------------------------------------------|
| `DATABASE_URL`    | yes                  | Neon Postgres                              |
| `JWT_SECRET`      | yes (in prod)        | JWT signing                                |
| `RESEND_API_KEY`  | preferred            | Resend HTTP API key (`re_…`)               |
| `MAIL_FROM`       | yes if sending       | e.g. `Octolio <noreply@octolio.me>` once domain is verified, else `onboarding@resend.dev` |
| `APP_URL` / `FRONTEND_URL` | yes         | base URL used in email links               |
| `SMTP_*`          | optional fallback    | only used if `RESEND_API_KEY` not set      |
| `EMAIL_DEBUG_TOKEN` | optional           | enables `/api/auth/email-diag`             |
| `STRIPE_*`, `ANTHROPIC_API_KEY` | yes      | for Stripe + AI advisor                    |

## Key Business Rules

### Energy System
- Every user (free and pro) has energy (max 12)
- Every lesson costs exactly **3 energy**
- Energy refills at **+3 per hour** (incremental, not full reset)
- `energy_refill_at` = timestamp when energy first dropped below 12
- Auto-refill runs on every `/me` call and before deduction in `/energy/use`
- **Pro users have unlimited energy** — `/energy/use` returns early with `{ energy, cost: 0, unlimited: true }`

### Hearts (Lives)
- All users (free AND pro) use the same 3-heart system during lessons
- Losing all hearts restarts from exercise 1 (same lesson, no energy refund)

### Modules
- Free modules: orders 1–9 (mix of static and generated)
- Pro-only modules: orders 10–12 (`advanced-investing`, `real-estate`, `tax-strategy`)
- Generated modules loaded from `generated-modules.json`, static modules override via merge
- Dashboard: pro users see ALL modules unlocked; free users see sequential lock
- Pro-only modules show `✦ PRO` badge

### AI Advisor
- Accessible only to `is_pro` users
- Route: `POST /api/ai/chat` — SSE stream
- Model: `claude-haiku-4-5-20251001`
- Free users see upsell wall with Stripe checkout button

## Deployment
- Render: backend + frontend as separate services
- Backend build command: `npm run build` (runs `tsc && cp src/data/generated-modules.json dist/data/generated-modules.json`)
- **`dist/` is committed to git** — always run `npm run build` in backend before committing
- Frontend: static build via Vite, `dist/` also committed

## Important Technical Notes

### Anthropic SDK Streaming (v0.30.x)
Use `.on('text')` + `await stream.done()` pattern:
```typescript
const stream = anthropic.messages.stream({ ... });
stream.on('text', (text) => res.write(`data: ${JSON.stringify({ text })}\n\n`));
await stream.done();
res.write('data: [DONE]\n\n');
res.end();
```
**Do NOT** use `for await (chunk of stream)` — unreliable at this SDK version.
Always call `res.flushHeaders()` before streaming to send SSE headers immediately.

### JSON files and tsc
`tsc` does NOT copy non-`.ts` files. JSON data files must be explicitly copied in the build script.

### CSS Custom Properties
Use explicit `hsl(228, 24%, 10%)` for critical UI backgrounds (like popovers) — some `var(--c-*)` CSS variables may be undefined/transparent in certain contexts.

### db.ts exports
`db.ts` exports `getPool()` function (not a `pool` object directly). Always use:
```typescript
import { getPool } from '../db';
const pool = getPool();
```

### Database schema (additive migrations only)
`initDb()` runs `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE … ADD COLUMN IF NOT EXISTS`
on every boot. Never drop columns — existing rows on Neon must keep working.

Key tables:
- `users` — verified accounts. `email_verified` defaults TRUE for accounts created
  via `/verify-email`. Existing rows (xp > 0 or last_active set) were grandfathered
  to `email_verified = TRUE` during the migration so the upgrade didn't lock anyone out.
- `pending_registrations` — unverified signups (PK `email`). Cleaned out on successful
  verification. Index on `LOWER(name)` for nickname collision checks.
- `progress` — lesson completions, `UNIQUE(user_id, lesson_id)`.

### Email never blocks an API response
All `sendVerificationEmail` / `sendPasswordResetEmail` calls go through the
`fireEmail()` helper which `.catch()`-es errors. Never `await` them in a route
handler — Render-blocked SMTP can stall for 60+ seconds and freeze the user.

## Exercise System

### Exercise Types (12 total)
| Type | Component | Description |
|------|-----------|-------------|
| `theory` | TheoryCard | Multi-page theory slides, auto-completes with 0 XP |
| `choice` | (inline in ExerciseRenderer) | Multiple choice with A/B/C/D options |
| `fill_blank` | (inline in ExerciseRenderer) | Numeric input with min/max range |
| `fill_number` | FillNumber | Numeric answer with tolerance, scenario + hint |
| `budget_slider` | BudgetSlider | Allocate budget across categories with sliders |
| `rpg_scenario` | RPGScenario | Interactive RPG financial scenario |
| `rat_race` | RatRaceGame | Rat race board game simulation |
| `compound_sim` | CompoundSim | Compound interest visual simulator |
| `sort_items` | SortItems | Sort items into correct categories |
| `match_terms` | MatchTerms | Match terms to their definitions |
| `order_items` | OrderItems | Arrange items in correct sequence |
| `true_false` | TrueFalse | Evaluate statements as true or false |
| `scenario_decision` | ScenarioDecision | Choose between scenario options, see outcomes |

### Lesson Structure Rules
- Each lesson has 6–7 exercises
- **Theory always goes first** (1–2 slides max per theory block)
- Remaining exercises follow Bloom's taxonomy progression: remember → understand → apply → analyze → evaluate → consolidate
- **Exercise order must vary between lessons** — no two lessons in the same module should have the same exercise type at the same position
- Use diverse exercise types within each lesson (avoid repeating the same type)

### Adding New Exercises
1. Define exercise data in `backend/src/data/lessons.ts` with all required fields for that type
2. All user-facing strings must be `LocalizedText { en: string; bg: string }`
3. Run `npm run build` in `backend/` to compile to `dist/`
4. Exercise components live in `frontend/src/components/exercises/`
5. New types must be registered in `ExerciseRenderer.tsx` and `types/index.ts`

## Languages
- App supports English (`en`) and Bulgarian (`bg`)
- `useLang()` hook provides `{ ui, lang, setLang }`
- Always add both language strings when adding user-facing text
