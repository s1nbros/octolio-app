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
        progress.ts             — lesson completion, energy deduction, streak freeze auto-consume, cross-XP notify
        ai.ts                   — AI advisor SSE endpoint (Pro-only)
        stripe.ts               — Stripe checkout + webhook
        review.ts               — spaced-repetition: missed/due/done/stats endpoints
        freeze.ts               — streak-freeze shop: buy/info endpoints
        friends.ts              — friend requests, search, accept/decline, cross-XP detection helper
        notifications.ts        — in-app notification feed (list/unread/read)
        chests.ts               — chest-info + transactional open
        shop.ts                 — cosmetics catalog / buy / equip / XP exchange / inventory
      data/
        lessons.ts              — all modules + lessons + exercises (one big array)
        generated-modules.json  — generated free-tier modules
        catalog.ts              — cosmetics catalog + reward pool weights + XP exchange consts
      middleware/auth.ts        — JWT authenticate middleware
      db.ts                     — exports getPool()
    dist/                   — compiled output, committed to git for Render
    package.json            — build: "tsc && cp src/data/generated-modules.json dist/data/generated-modules.json"
  frontend/
    src/
      pages/
        Modules.tsx         — module list (formerly Dashboard role)
        Lesson.tsx          — exercise flow with hearts + energy; records misses for SR
        Review.tsx          — spaced-repetition session (reuses ExerciseRenderer)
        Tools.tsx           — calculator hub (compound/mortgage/debt/FIRE/goal/net-worth)
        Shop.tsx            — cosmetics shop (browse / buy / equip / XP→coin exchange)
        Friends.tsx         — friend list, incoming/outgoing requests, search-by-name
        Quests.tsx          — daily quests + streak overview
        Profile.tsx         — stats, achievements, octopus mascot + wallet, streak-freeze shop, sub mgmt
        League.tsx          — XP leaderboard
        AiAdvisor.tsx       — AI chat (Pro-only, SSE streaming)
        Onboarding.tsx      — pro-vs-free plan picker (gated route)
        GeneratedLesson.tsx — AI-generated lesson runner
        Register.tsx        — debounced live availability hints (banned/taken)
        Login.tsx           — links to /forgot-password, surfaces "resend verification" inline
        VerifyEmail.tsx     — "Check your inbox" page; auto-verify via ?token=…, manual code form
        ForgotPassword.tsx  — request reset email
        ResetPassword.tsx   — set new password from emailed token
        Landing.tsx         — marketing landing for unauth users
      components/
        Navbar.tsx          — mobile-only header: energy pill + logo-button drawer trigger
        AppShell.tsx        — desktop sidebar (md+) with Learn/Quests/Review/Tools/League/Advisor + due-count badge
        ExerciseRenderer.tsx — routes exercise.type to specialized components (handles wrong-answer Continue too)
        DailyQuests.tsx     — quest cards on Quests page
        SidebarWidgets.tsx  — Pro upsell, league preview, streak, money-fact widgets
        ProfileSheet.tsx
        ModuleCard.tsx
        FloatingOrbs.tsx
        NotificationBell.tsx — bell + dropdown, polls /api/notifications/unread-count every 30s
        OctopusAvatar.tsx    — animated SVG mascot, renders equipped cosmetic emoji per slot
        ChestModal.tsx       — CS:GO-style chest opening with horizontal reel
        exercises/
          TheoryCard.tsx        — theory slides (swipeable pages)
          RPGScenario.tsx       — branching-story financial scenarios
          BudgetSlider.tsx      — budget allocation with sliders
          RatRaceGame.tsx       — rat race board game simulation
          CompoundSim.tsx       — compound interest visual simulator
          SortItems.tsx         — drag-to-sort into categories
          MatchTerms.tsx        — match terms to definitions
          OrderItems.tsx        — arrange items in correct order
          TrueFalse.tsx         — true/false statement evaluation
          ScenarioDecision.tsx  — multi-choice scenario with outcomes
          FillNumber.tsx        — numeric answer with tolerance range
          StockChart.tsx        — interactive price chart (identify_point / identify_pattern)
          PortfolioPie.tsx      — allocate % across assets with live pie viz
          DebtPayoff.tsx        — snowball/avalanche/even simulator with month + interest output
          TaxBrackets.tsx       — progressive brackets viz, effective vs marginal rate
          IncomeStreams.tsx     — pick a mix of side hustles to hit €/mo target within hour budget
          CoverageCalc.tsx      — tune insurance premium / deductible / coverage limit
          RiskMatrix.tsx        — sort risks into a 2×2 impact-vs-likelihood grid
          UnitPrice.tsx         — pick best price-per-unit across packaging options
      contexts/
        AuthContext.tsx      — user state, updateUser, refreshUser
        LanguageContext.tsx  — EN/BG
        ThemeContext.tsx
      shared/
        catalogClient.ts     — mirror of backend cosmetics catalog (kept in sync manually)
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

### Streak System & Freezes
- Streak bumps +1 the first time a user completes a lesson on a NEW calendar day
- Day calculation in `/api/progress/complete` is calendar-day diff between today and `last_active`
  - `daysSince === 0` → no change (already practiced today)
  - `daysSince === 1` → streak += 1
  - `daysSince > 1` → spend `daysSince - 1` freezes; if user has enough, streak += 1; otherwise streak resets to 1
- **Streak Freezes** (`users.streak_freezes` column, max 3, cost 100 XP each):
  - Bought via `POST /api/freeze/buy` (Profile page has the shop UI)
  - Auto-consumed lazily on the next lesson complete after a missed day
  - Inventory queried via `GET /api/freeze/info`
- The `/complete` response includes `streak_freezes` (new total) and `freezesUsed` (this run)

### Spaced Repetition Review
- Every wrong answer in a lesson POSTs to `/api/review/missed` (fire-and-forget from `Lesson.tsx`)
- Tracked in the `exercise_reviews` table with a Leitner-box level (1–5)
- Box → next-review delay: **1 → 1d, 2 → 3d, 3 → 7d, 4 → 21d, 5 → 60d (mastered)**
- Theory exercises are skipped (no "wrong answer" possible)
- `/review` page pulls up to 20 due cards from `GET /api/review/due`, hydrates them by looking up exercise data from `lessons.ts` (so the table stays small and exercise content stays editable)
- On answer: correct → promote one box; wrong → reset to box 1
- Sidebar badge shows due-count via `GET /api/review/stats` (refreshes on route change)

### Tools Tab (`/tools`)
- Pure client-side calculator hub — no backend state except Net Worth (localStorage `octolio_net_worth_v1`)
- Six tabs: Compound, Mortgage, Debt payoff, FIRE, Savings goal, Net worth
- Debt payoff reuses the same snowball/avalanche/even math as the `debt_payoff` exercise
- All calculators are bilingual via `useLang()`

### Cosmetics Economy (Octopus mascot, coins, chests, shop)
A second-currency layer that runs alongside XP — purely cosmetic / fun, no
gameplay-power gating. Three coupled systems:

**Octopus mascot** (`OctopusAvatar.tsx`)
- Pure CSS/SVG octopus with idle bob + tentacle sway + occasional eye blink
- Renders an equipped cosmetic emoji on top, positioned per slot (`hat` / `face` / `body`)
- Single slot is equipped at a time via `users.equipped_costume` (item ID)
- Shown on the Profile page header card; the Shop page uses it as a live preview

**Octolio Coins** (`users.coins INTEGER DEFAULT 0`)
- Earned from chest opens (random) and from selling XP via the shop exchanger
- Spent on shop items
- XP→coins rate: `XP_PER_COIN_EXCHANGE_RATE = 2` (2 XP = 1 coin), `MIN_XP_EXCHANGE = 100`

**Chests** (`backend/src/routes/chests.ts` + `chest_opens` table)
- 1 chest per `LESSONS_PER_CHEST = 3` completed lessons
- Tracked via `users.chests_opened` counter; `available = floor(completed/3) - opened`
- Reward pool defined in `backend/src/data/catalog.ts`:
  - 40% coins (25 / 75 / 200 / 1000 weighted)
  - 25% XP (20 / 50 / 150)
  - 10% streak freeze (+1, capped at 3)
  - 10% energy (+3, capped at 12)
  - 15% cosmetic item (rarity-weighted, never gives duplicates)
- Open is a single transactional `POST /api/chests/open` that re-checks availability
  with `FOR UPDATE` to prevent double-spend
- Frontend: `ChestModal.tsx` shows a CS:GO-style horizontal reel — 60 decoy tiles
  with the real winning tile at index 52, animates with cubic-bezier(0.05,0.7,0.15,1)
  over 5s using `animation-fill-mode: forwards`. The `--reel-end` CSS variable controls
  the final translateX with a small jitter so it doesn't land dead-center.

**Shop** (`backend/src/routes/shop.ts` + `user_inventory` table + `/shop` page)
- Catalog lives in `backend/src/data/catalog.ts` AND mirrored in
  `frontend/src/shared/catalogClient.ts` (kept in sync manually)
- 16 cosmetics across 3 slots (hat / face / body) and 4 rarities
- Rarity → max price ladder: common 100–200 / rare 250–400 / epic 500–800 / legendary 1500–2500
- Endpoints: `GET /catalog`, `GET /inventory`, `POST /buy`, `POST /equip`, `POST /exchange`
- All cosmetics are visible only — no gameplay effect

### Modules
- Free modules: orders 1–9 (static curated + generated fallback)
- Pro-only modules: orders 10+ (`advanced-investing`, `real-estate`, `tax-strategy`, etc.)
- Generated modules loaded from `generated-modules.json`; static `staticModules` array in `lessons.ts` overrides by ID via the merge step
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
  Recent additions: `streak_freezes INTEGER DEFAULT 0`, `coins INTEGER DEFAULT 0`,
  `equipped_costume TEXT`, `chests_opened INTEGER DEFAULT 0`.
- `pending_registrations` — unverified signups (PK `email`). Cleaned out on successful
  verification. Index on `LOWER(name)` for nickname collision checks.
- `progress` — lesson completions, `UNIQUE(user_id, lesson_id)`.
- `exercise_reviews` — spaced-repetition cards. `UNIQUE(user_id, module_id, lesson_id, exercise_id)`.
  Columns: `box_level` (1–5), `next_review_at`, `first_missed_at`, `last_reviewed_at`,
  `times_reviewed`, `times_correct`, `mastered`. Partial index on `(user_id, next_review_at) WHERE mastered = FALSE`.
- `user_inventory` — owned cosmetics. `UNIQUE(user_id, item_id)`. Item IDs are stable strings from `catalog.ts`.
- `chest_opens` — audit log of every chest pull. Columns: `reward_type`, `reward_value`, `coins_delta`, `xp_delta`, `opened_at`.

### Email never blocks an API response
All `sendVerificationEmail` / `sendPasswordResetEmail` calls go through the
`fireEmail()` helper which `.catch()`-es errors. Never `await` them in a route
handler — Render-blocked SMTP can stall for 60+ seconds and freeze the user.

## Exercise System

### Exercise Types (21 total)

**Core types (work in any module):**
| Type | Component | Description |
|------|-----------|-------------|
| `theory` | TheoryCard | Multi-page theory slides, auto-completes with 0 XP |
| `choice` | (inline in ExerciseRenderer) | Multiple choice with A/B/C/D options |
| `fill_blank` | (inline in ExerciseRenderer) | Numeric input with min/max range |
| `fill_number` | FillNumber | Numeric answer with tolerance, scenario + hint |
| `budget_slider` | BudgetSlider | Allocate budget across categories with sliders |
| `rpg_scenario` | RPGScenario | Branching-story financial scenario |
| `rat_race` | RatRaceGame | Rat race board game simulation |
| `compound_sim` | CompoundSim | Compound interest visual simulator |
| `sort_items` | SortItems | Sort items into correct categories |
| `match_terms` | MatchTerms | Match terms to their definitions |
| `order_items` | OrderItems | Arrange items in correct sequence |
| `true_false` | TrueFalse | Evaluate statements as true or false |
| `scenario_decision` | ScenarioDecision | Choose between scenario options, see outcomes |

**Module-signature types (designed for specific modules):**
| Type | Component | Used by | Description |
|------|-----------|---------|-------------|
| `stock_chart` | StockChart | Investing, Advanced Investing | Interactive price chart; click best entry point OR pick pattern label |
| `portfolio_pie` | PortfolioPie | Investing, Advanced Investing | Live pie viz; sliders allocate % across asset classes; tolerance-matched to ideal |
| `debt_payoff` | DebtPayoff | Credit & Debt | Pick snowball/avalanche/even strategy; sim outputs months + total interest |
| `tax_brackets` | TaxBrackets | Tax Strategy | Progressive bracket viz with income slider; computes effective vs marginal rate |
| `income_streams` | IncomeStreams | Side Hustles | Pick mix of streams to hit €/mo target without exceeding weekly hour budget |
| `coverage_calc` | CoverageCalc | Insurance | Tune premium / deductible / coverage limit; shows expected-value math |
| `risk_matrix` | RiskMatrix | Risk Management / Emergency Planning | Sort risks into 2×2 impact-vs-likelihood grid (Accept/Mitigate/Transfer/Avoid) |
| `unit_price` | UnitPrice | Smart Shopping | Pick best price-per-unit across packaging options |

### Lesson Structure Rules
- Each lesson has 6–7 exercises (target: 7)
- **Theory always goes first** (1–2 slides max per theory block)
- Remaining exercises follow Bloom's taxonomy progression: remember → understand → apply → analyze → evaluate → consolidate
- **Exercise order must vary between lessons** — no two lessons in the SAME module should share the same exercise type at the same position (theory at position 1 is the exception)
- Use diverse exercise types within each lesson (avoid repeating the same type)
- After authoring a module, verify with a position-clash script: for each `(module, position)`, the set of types across lessons should be all-distinct

### Adding New Exercises
1. Define exercise data in `backend/src/data/lessons.ts` with all required fields for that type
2. All user-facing strings must be `LocalizedText { en: string; bg: string }`
3. Run `npm run build` in `backend/` to compile to `dist/`
4. Exercise components live in `frontend/src/components/exercises/`
5. New types must be registered in:
   - `frontend/src/types/index.ts` (union type + new fields)
   - `frontend/src/components/ExerciseRenderer.tsx` (routing case)
   - `backend/src/data/lessons.ts` (union type + new fields, mirrored)
6. Wrong answers automatically get recorded in spaced-repetition unless the type is `theory`

### Wrong-answer flow
- Every non-theory exercise component calls `onAnswer(false, 0)` when the user answers wrong
- `Lesson.tsx`'s `handleAnswer` decrements hearts + POSTs to `/api/review/missed` (fire-and-forget)
- After all hearts are lost, the lesson restarts from exercise 1 (XP for that run is zeroed)
- Some components (e.g. `PortfolioPie`, `DebtPayoff`, `CoverageCalc`, `TaxBrackets`, `StockChart`) explicitly render a "Continue →" button after a wrong submit so the user can read the explanation before progressing

## API Surface

Auth + user (`/api/auth/*`):
`/register`, `/verify-email`, `/resend-verification`, `/login`, `/forgot-password`, `/reset-password`,
`/me`, `/onboarding`, `/check-name`, `/check-availability`, `/league`, `/email-diag`

Lessons + progress:
- `GET /api/modules` — list modules with completion + lock state
- `GET /api/modules/:moduleId/lessons/:lessonId` — single lesson
- `GET /api/progress` — completion history + XP + streak
- `POST /api/progress/energy/use` — deduct 3 energy (no-op for Pro)
- `POST /api/progress/complete` — mark lesson done, bump XP + streak, auto-consume freezes

Spaced repetition (`/api/review/*`):
- `POST /missed` `{moduleId, lessonId, exerciseId}` — upsert into box 1
- `GET /due` — hydrated due cards (up to 20)
- `POST /done` `{cardId, correct}` — promote (correct) or reset (wrong)
- `GET /stats` — `{total, due, mastered}`

Streak freezes (`/api/freeze/*`):
- `GET /info` — `{cost, max, stock, xp, can_afford}`
- `POST /buy` — −100 XP, +1 freeze (capped at 3)

Chests (`/api/chests/*`):
- `GET /info` — `{available, opened, earned, completedLessons, nextChestInLessons, recentOpens[]}`
- `POST /open` — atomically draws + applies a reward, returns `{reward, item, coinsDelta, xpDelta, availableChestsRemaining}`

Shop (`/api/shop/*`):
- `GET /catalog` — all items with `{owned, equipped}` joined for the caller
- `GET /inventory` — items the user owns
- `POST /buy` `{itemId}` — −price coins, +inventory row
- `POST /equip` `{itemId | null}` — set/clear `users.equipped_costume`
- `POST /exchange` `{xpAmount}` — −XP / +coins at rate `XP_PER_COIN_EXCHANGE_RATE`

Friends + notifications (`/api/friends/*`, `/api/notifications/*`):
- request / accept / decline / cancel / remove / search; notifications list / unread-count / mark-read

Other: `/api/ai/chat` (Pro SSE), `/api/stripe/*` (checkout + webhook), `/api/generate/*` (AI lesson generation)

## Languages
- App supports English (`en`) and Bulgarian (`bg`)
- `useLang()` hook provides `{ ui, lang, setLang }`
- Always add both language strings when adding user-facing text
