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
        Modules.tsx         — module list with snake-pattern lesson path + inline chest nodes
        Lesson.tsx          — exercise flow with hearts + energy; records misses for SR
        Review.tsx          — spaced-repetition session (reuses ExerciseRenderer)
        Tools.tsx           — calculator hub (compound/mortgage/debt/FIRE/goal/net-worth)
        Shop.tsx            — cosmetics shop (browse / buy / equip-per-slot / XP→coin exchange)
        Quests.tsx          — daily quests + streak overview
        Profile.tsx         — 4 tabs: overview / achievements / friends / settings
                              ─ overview: mascot card + wallet, streak-freeze shop, sub mgmt
                              ─ friends: <FriendsSection /> (replaces the old standalone /friends page)
                              ─ tab is sync'd to URL ?tab=... so deep links work
        League.tsx          — XP leaderboard; rows tap-to-open <UserProfileModal/>
        AiAdvisor.tsx       — AI Coach chat UI (/advisor). Pro-gated (free users get an
                              upsell wall); Pro users get a message list + input that POSTs
                              the transcript to /api/ai/chat (Gemini) and renders {text}.
                              Suggestion chips seed the empty state. Nav link enabled for all
                              (free → upsell) in both AppShell sidebar + Navbar mobile drawer.
        Onboarding.tsx      — pro-vs-free plan picker (gated route)
        GeneratedLesson.tsx — AI-generated lesson runner
        Register.tsx        — debounced live availability hints (banned/taken)
        Login.tsx           — links to /forgot-password, surfaces "resend verification" inline
        VerifyEmail.tsx     — "Check your inbox" page; auto-verify via ?token=…, manual code form
        ForgotPassword.tsx  — request reset email
        ResetPassword.tsx   — set new password from emailed token
        Landing.tsx         — marketing landing for unauth users
        ─ note: legacy /friends route now <Navigate>s to /profile?tab=friends
      components/
        Navbar.tsx          — mobile-only header: hamburger drawer button + energy + bell + avatar
        AppShell.tsx        — desktop sidebar (md+) with Learn/Quests/Review/Tools/League/Shop +
                              top StatsBar (Streak / Energy / XP / Coins / PRO) with click tooltips
                              + mounts <WhatsNewModal/>
        ExerciseRenderer.tsx — routes exercise.type to specialized components (handles wrong-answer Continue too)
        DailyQuests.tsx     — quest cards on Quests page
        SidebarWidgets.tsx  — Pro upsell, league preview, streak, money-fact widgets
        ProfileSheet.tsx    — mobile profile drawer; shows octopus mascot + 4-stat grid
        ModuleCard.tsx
        FloatingOrbs.tsx
        NotificationBell.tsx — bell + dropdown, polls /api/notifications/unread-count every 30s
        OctopusAvatar.tsx    — animated SVG mascot, renders hat + face + body emojis simultaneously
        ChestModal.tsx       — CS:GO-style chest opening, per-position (target = {moduleId, position})
        ChestIcon.tsx        — branded treasure-chest SVG (replaces 🎁 emoji); status: available|opened|locked
        CoinIcon.tsx         — branded gold-coin SVG (replaces 🪙 emoji which renders unevenly)
        UserProfileModal.tsx — mini snapshot modal for any user; mascot + stats + friendship action
        FriendsSection.tsx   — friends UI as a Profile tab (sub-tabs: friends / requests / add)
        WhatsNewModal.tsx    — swipeable feature-tour modal shown once per device per update version
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

### Google sign-in (`POST /api/auth/google`)
- Frontend renders the official Google button via Google Identity Services
  (script loaded once in `index.html`, component is `<GoogleSignInButton />`).
- The browser receives an ID-token JWT (`credential`) from Google and POSTs it
  to `/api/auth/google` along with `rememberMe`.
- Backend verifies the token against `GOOGLE_CLIENT_ID` (audience check + signature)
  using `google-auth-library`. Token must have `email_verified = true`.
- Account resolution order (in `auth.ts → /google`):
  1. `users.google_id = sub` → returning Google user, fast path.
  2. `users.email = payload.email` → existing email/password account; we set
     `google_id` on it so future Google sign-ins hit the fast path.
  3. Otherwise → create a brand-new row. `password_hash` stays NULL,
     `email_verified = TRUE`, `onboarding_done = FALSE` so they go through
     `/onboarding` next. Nickname is auto-derived from the email's local-part
     (sanitised + suffixed on collision) by `generateAvailableNickname()`.
- Streak is bumped the same way as `/login` (calendar-day diff).
- Response shape mirrors `/login`: `{ token, rememberMe, user }`.
- `PATCH /api/auth/password` refuses for Google-only accounts (no
  `password_hash` to validate `currentPassword` against). They have to use
  "Forgot password" first to set one.

### Required env vars (Google sign-in)
| var                       | scope    | purpose                                  |
|---------------------------|----------|------------------------------------------|
| `GOOGLE_CLIENT_ID`        | backend  | audience the ID token must match         |
| `VITE_GOOGLE_CLIENT_ID`   | frontend | same client ID baked into the SPA bundle |

Both should be set to the same **Web application** OAuth 2.0 Client ID from
Google Cloud Console. If `VITE_GOOGLE_CLIENT_ID` is unset, the button renders
a dev-only orange stub instead of failing silently.

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
| `STRIPE_*`        | yes                  | Stripe checkout + webhook                   |
| `GEMINI_API_KEY`  | yes for AI features  | free Google AI Studio key powering BOTH `/api/ai/chat` and `/api/ai/explain` |
| `GEMINI_MODEL`    | optional             | overrides the Gemini model id (default `gemini-2.5-flash-lite`) |
| `ANTHROPIC_API_KEY` | no longer used     | app fully migrated off Anthropic to Gemini for AI |
| `GOOGLE_CLIENT_ID` | yes if Google sign-in | OAuth 2.0 Web Client ID — audience for ID-token verification |

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
- Pure CSS/SVG octopus with idle bob + tentacle sway + 4.5s eye blink
- Renders **multi-slot** simultaneously — one emoji per slot (`hat` + `face` + `body`)
  stacked on the same mascot. Per-slot positioning constants in the component:
  - hat: `top: -18% · size: 0.52s` (sits above the head)
  - face: `top: 13% · size: 0.34s` (lands on the eyes — eyes are at 37.5% in the SVG)
  - body: `bottom: 2% · size: 0.38s` (over the tentacles)
- Each slot's wrapper centers via `marginLeft: -W/2` (NOT `translateX`) so the inner
  CSS hat-tilt animation can mutate `transform` without breaking the centering
- Shown in: Profile mascot card, Shop preview, mini `UserProfileModal`, `ProfileSheet`,
  and the `WhatsNewModal` mascot slide

**Octolio Coins** (`users.coins INTEGER DEFAULT 0`)
- Earned only by **trading XP** via the shop exchanger (chests no longer drop coins)
- Spent on shop items
- XP→coins rate: `XP_PER_COIN_EXCHANGE_RATE = 2` (2 XP = 1 coin), `MIN_XP_EXCHANGE = 100`
- The shop exchanger UI uses `inputMode="numeric"` + a digit-strip on change (NOT
  `type="number"` with `min/step` — iOS Safari rejects intermediate values mid-typing).
  A MAX chip inside the input rounds the user's XP down to the largest even amount.

**Branded icons** (visual consistency across platforms)
- `CoinIcon.tsx` — SVG gold coin with radial gradient, inner ring, "O" mark, shine.
  Replaces the 🪙 emoji which fell back to a plain circle on some devices.
- `ChestIcon.tsx` — SVG treasure chest (wooden body, curved lid, gold trim band,
  vertical corner trims, lock plate with keyhole, lid gleam). `status` prop swaps
  the palette: `available` (warm wood + gold), `opened` (muted green), `locked` (cold grey).

**Chests** (`backend/src/routes/chests.ts` + `chest_opens` + `module_chests` tables)
- Chests are **per-module**, NOT global. Each module gets up to 2 chest positions:
  - `mid` — unlocks after lesson at index `floor(N/2) - 1`
  - `end` — unlocks after the last lesson
  - Modules with only 1 lesson get just an `end` chest
- A chest is `available` when every lesson up to and including its anchor index is
  completed; `opened` once a row exists in `module_chests(user_id, module_id, position)`.
- Reward pool is **XP-only** (no coins / freezes / energy / cosmetics from chests).
  Defined in `backend/src/data/catalog.ts` `POOL`:
  - 25 XP (weight 30) — common
  - 50 XP (weight 25) — common
  - 100 XP (weight 20) — common
  - 200 XP (weight 13) — rare
  - 500 XP (weight 8) — epic
  - 1000 XP (weight 3) — legendary
  - 2500 XP (weight 1) — mythic jackpot
- Open is a single transactional `POST /api/chests/open {moduleId, position}` that
  re-validates with `buildChestStates()` inside `BEGIN`/`COMMIT`. `module_chests` has
  `UNIQUE(user_id, module_id, position)` as the final guard against double-open.
- Frontend: `Modules.tsx` renders a `ChestNode` in the snake-pattern path right after
  the lesson that unlocks it (gold + pulsing when available, grey + ✓ when opened,
  cold grey + 🔒 when locked). Tapping an available chest opens `ChestModal` with
  `target={{moduleId, position}}`.
- `ChestModal.tsx` shows a CS:GO-style horizontal reel — 60 decoy tiles with the real
  winning tile at index 52, animates with `cubic-bezier(0.05, 0.7, 0.15, 1)` over 5s
  using `animation-fill-mode: forwards`. The `--reel-end` CSS variable controls the
  final translateX with a small jitter so it doesn't land dead-center.

**Shop** (`backend/src/routes/shop.ts` + `user_inventory` table + `/shop` page)
- Catalog lives in `backend/src/data/catalog.ts` AND mirrored in
  `frontend/src/shared/catalogClient.ts` (keep in sync manually)
- 28 cosmetics across 3 slots (hat / face / body) and 4 rarities (emoji glyphs)
- Rarity → price ladder: common 100–200 / rare 250–400 / epic 500–800 / legendary 1500–2500
- **Multi-slot equip**: each slot is independent. Equipping a hat does NOT unequip
  your sunglasses. Stored as 3 separate columns (`equipped_hat`, `equipped_face`,
  `equipped_body`) on `users`. The legacy single `equipped_costume` column is kept
  for grandfathering and back-filled on boot into the right per-slot column.
- Endpoints: `GET /catalog` (returns `equipped: {hat, face, body}`), `GET /inventory`,
  `POST /buy`, `POST /equip {itemId}` (slot inferred from catalog), `POST /unequip {slot}`,
  `POST /exchange {xpAmount}`
- All cosmetics are visible only — no gameplay effect

### Friends & in-app notifications
- Friends are a `Profile` tab, not a top-level nav item (the legacy `/friends` URL
  redirects to `/profile?tab=friends`).
- `FriendsSection` has 3 sub-tabs: friends list / pending requests / add by username search.
- Friendship row in `friendships` table: `(requester_id, recipient_id, status)` with
  `status ∈ pending | accepted | declined`. Re-requesting a previously-declined edge
  flips it back to `pending`. Mutual pending (A→B then B→A) auto-accepts.
- `UserProfileModal` opens whenever you tap any user (League row, friends list,
  search result, etc.). Shows the target's mascot with their equipped cosmetics,
  level, XP / streak / lessons stats, and one dynamic action button that morphs
  based on friendship status:
  - `none` → "+ Add friend"
  - `pending_out` → "Request sent — tap to cancel"
  - `pending_in` → "Accept friend request"
  - `friends` → "✓ Friends" + a separate "Remove" button
  - `self` → "That's you!"
- Backend endpoint: `GET /api/friends/preview/:id` returns the snapshot + friendship
  status + the pending requestId so the modal can wire Accept/Cancel directly.
- **Friend streaks** (`friend_streaks` table): a shared streak between two friends
  that grows +1 on every calendar day BOTH were active (lesson OR Daily Workout) and
  breaks once a day passes without both. Stored one row per pair, normalized
  `(user_low < user_high)`. Logic in `backend/src/services/friendStreak.ts`:
  - `updateFriendStreaksForUser(userId, today)` is called fire-and-forget after the
    user is marked active in `/api/progress/complete` AND `/api/workout/answer`. It
    finds accepted friends whose `users.last_active = today` and does a single atomic
    once-per-day upsert per pair (`ON CONFLICT … WHERE last_incr_date IS DISTINCT FROM
    today` guards against double-count when both finish at once).
  - Milestones (3/7/14/30/50/100/200/365) push a `friend_streak` notification to both.
  - `effectiveStreak(count, lastIncrDate, today)` returns the display value — alive if
    the last bump was today or yesterday, else 0 (broken).
  - Surfaced in `GET /api/friends/list` (`friend_streak` per friend, shown as a `🤝🔥N`
    badge in `FriendsSection`) and `GET /api/friends/preview/:id` (`friendStreak`,
    shown as a banner in `UserProfileModal`).
- **Friend quests** (`friend_quests` table): a weekly co-op goal per friend pair.
  Both friends' XP earned during the ISO week (Monday-anchored, UTC) counts toward a
  shared `goal` (`QUEST_GOAL = 500`); at the goal each friend can claim a reward once
  (`QUEST_REWARD_XP = 120`, `QUEST_REWARD_COINS = 25`). Logic in
  `backend/src/services/friendQuest.ts`:
  - `contributeToFriendQuests(userId, xpEarned, today)` is called fire-and-forget from
    `/api/progress/complete` (lesson XP) and `/api/workout/answer` (workout XP); it
    upserts the current-week row, adding the XP to the caller's side.
  - `GET /api/friends/quests` → `{weekStart, goal, quests[]}` (per-friend combined
    progress, your/their split, `claimable`/`claimed`).
  - `POST /api/friends/quests/claim {friendId}` — transactional + FOR UPDATE; validates
    goal met and not already claimed by the caller, then awards XP+coins.
  - Frontend: a "Weekly co-op quests" section at the top of the friends sub-tab in
    `FriendsSection` (progress bar + Claim button), shown for pairs with any progress.
- **Cross-XP notifications**: when a friend overtakes you in XP, the loser gets a
  notification. Detected in `/api/progress/complete` after a user completes a lesson:
  for each `friend` with `friend.xp >= oldXp AND friend.xp < newXp`, insert a
  `friend_overtook` row into `notifications`.
- `NotificationBell` lives in both the desktop sidebar logo bar and the mobile
  Navbar; polls `/api/notifications/unread-count` every 30s; click opens a dropdown
  that lists the last 30 notifications and marks them read on tap. Each notification
  carries an optional `link` and a typed `metadata` JSONB blob.

### Wheel of Luck (one-time welcome gift)
- Shown once per account, ever, on the first authenticated visit after
  onboarding is complete (gated in `AppShell` via `user.wheel_spun !== true`).
- Mounted as a fullscreen modal — the user must spin and claim before they
  can use the app.
- 10 visible slots: 6 XP tiers (25/50/100/200/500/1000), 2 cosmetic tiers
  (common/rare), 14-day Pro trial, and the Octolio cup (legendary).
- **All prize logic is server-side** in `backend/src/routes/wheel.ts`:
  - `crypto.randomInt` for an unguessable weighted draw.
  - The whole spin runs inside a transaction with `SELECT FOR UPDATE` on the
    user row so double-spins are impossible.
  - **Global cup supply cap = 3.** If the draw lands on `cup` but
    `SELECT COUNT(*) FROM wheel_prizes WHERE reward_type='cup'` is already ≥ 3,
    we silently swap the slot to `xp_1000` so the user still gets a nice prize.
  - Cosmetic rewards pick a random unowned item of the requested rarity from
    the existing `CATALOG`. If the user owns everything, we fall back to 500 XP.
  - Pro trial sets `users.is_pro = TRUE` AND `users.pro_trial_ends_at = NOW() + 14 days`.
    `/api/auth/me` lazily downgrades expired trials (only if they don't ALSO
    have a `stripe_subscription_id` — paid subs survive trial expiry).
- Endpoints:
  - `GET  /api/wheel/info`  → `{ canSpin, slots[], cupSupplyTotal }` — slot
    weights are NOT in the public payload (anti-cheat).
  - `POST /api/wheel/spin` → `{ slotIndex, slot, reward }` — `slotIndex`
    drives the frontend wheel-rotation animation to land on the right slice.
- Every spin is logged to `wheel_prizes (user_id, reward_type, reward_value, won_at)`.
  Cup winners list:
  ```sql
  SELECT u.id, u.name, u.email, w.won_at
  FROM wheel_prizes w JOIN users u ON u.id = w.user_id
  WHERE w.reward_type = 'cup'
  ORDER BY w.won_at;
  ```
- Frontend: `<WheelOfLuck />` in `frontend/src/components/WheelOfLuck.tsx`.
  Pure SVG slices + a `transition: transform Xs cubic-bezier(...)` for the
  spin, custom `@keyframes prize-pop` and `@keyframes confetti-fall` for the
  reveal. No external animation library.

### "What's new" announcement modal
- `WhatsNewModal` pops up once per device after a user is authenticated + onboarded.
- Storage key `octolio_seen_whatsnew_v3` — set on dismiss. **Bump the version
  (vN → vN+1) whenever you ship an update** to re-show the tour to everyone.
- Current v3 slides announce: AI "Explain my mistake", Friend streaks, and Weekly
  co-op quests. Illustrations are rendered live (mock explain card, paired avatars
  with a 🤝🔥 badge, and a co-op quest card with progress bar).
- Mounted in `AppShell` so it only triggers on protected routes. 700ms delay so it
  doesn't pop the instant the page mounts.
- Swipeable: touchstart/move/end with a 50px threshold; arrow keys ← → on desktop;
  pagination dots clickable; Esc closes; last slide button changes to "Got it →".
- Illustrations are **rendered live** (not static images) — they reuse `OctopusAvatar`,
  `CoinIcon`, mock leaderboard rows, and a faux compound-interest card with an SVG
  sparkline — so they never drift from the real UI.

### Daily-return mechanics (retention engine)
**Daily Money Workout** — a 60-second, single-question daily action that costs
NO energy, awards a small XP+coin reward once per calendar day, and **counts as
"active today" so it keeps the streak alive** (the daily bar drops to 60s).
- Question pool: `backend/src/data/workouts.ts`. Today's question is picked
  deterministically by UTC day number (`getTodaysWorkout`) so every user shares
  the same daily question (Wordle-style). `last_workout_date` (YYYY-MM-DD) on
  `users` gates the once-per-day reward.
- Endpoints (`/api/workout/*`): `GET /today` → `{alreadyDone, rewardXp, rewardCoins, question}`
  (correctIndex omitted); `POST /answer {choice}` → validates, awards (correct = 15 XP
  + 5 coins, wrong = 5 XP), runs the streak update, returns `{correct, correctIndex,
  explanation, xpAwarded, coinsAwarded, totalXp, coins, streak}`. Transactional, FOR UPDATE.
- Shared streak logic now lives in `backend/src/services/streak.ts`
  (`computeStreakUpdate`, `todayStr`). Both `/api/progress/complete` and the
  workout use it — identical calendar-day rules.

**Daily goal tracker** — uses the onboarding `daily_goal_min` (3/5/10 → target
1/2/3 lessons). `TodayPanel` shows progress = lessons completed today + workout.

**Reminder emails** (`/api/reminders/send`) — token-guarded by `REMINDER_CRON_TOKEN`
(404s if unset). Hit ONCE/DAY by an external scheduler (Render Cron, cron-job.org);
NOT triggered by the app. Smart Duolingo-style cadence (per user, in `decide()`):
  - active today → no email
  - 1–2 days inactive → STREAK reminder (`sendStreakReminderEmail`)
  - 3–29 days inactive → silent (no nagging)
  - 30+ days inactive → WIN-BACK ("we miss you", `sendWinbackEmail`), at most once
    every ~28 days (rate-limited by `last_reminder_sent`).
`last_reminder_sent` (YYYY-MM-DD) on `users` prevents double-sends + caps win-back.
Test helpers in the POST body: `{testEmail}` sends one to that user (bypasses cadence);
`{dryRun:true}` reports who WOULD be emailed without sending.

**Frontend:** `TodayPanel` (top of `Modules.tsx`) = daily goal pills + the workout
card + the portal-rendered answer modal. Updates xp/coins/streak in context on answer.

### Goal-based onboarding (wizard)
- `Onboarding.tsx` is a 5-step wizard, not just a plan picker:
  1. **Goal** — pick one of save / debt / invest / understand / budget
  2. **Diagnostic** — 3 quick questions → `experience_level` (beginner/intermediate/advanced)
  3. **Daily time** — 3 / 5 / 10 min → `daily_goal_min`
  4. **Plan reveal** — personalized "Money Plan" (goal + level + daily commitment + 3-step path)
  5. **Pricing** — the original free/pro picker (unchanged behavior)
- Shared definitions in `frontend/src/shared/onboardingData.ts` (GOALS, DIAGNOSTIC,
  DAILY_OPTIONS, `scoreToLevel`, `buildPlan`) — used by both the wizard and the dashboard.
- Profile persisted via `POST /api/auth/onboarding-profile {goal, experienceLevel, dailyGoalMin}`
  at the plan→pricing transition (so it saves regardless of free/pro choice). Does NOT set
  `onboarding_done` — that stays on `/onboarding` (free) or the Stripe webhook (pro).
- Columns on `users`: `goal TEXT`, `experience_level TEXT`, `daily_goal_min INTEGER DEFAULT 5`.
  Surfaced in `/me`. `AuthContext.saveOnboardingProfile()` updates them.

### Continue hero (dashboard)
- `Modules.tsx` renders a `<ContinueHero>` at the top — the single obvious "what do I do next".
- Shows the current lesson (module name + lesson title + XP + exercise count) with one big
  Continue CTA → jumps straight to that lesson. Reuses the existing `currentPos` (first
  unlocked, not-completed lesson). Shows goal context ("On your way to: …") if `user.goal` is
  set, plus the streak flame. "All caught up" state when every lesson is done.

### Modules
- Free modules: orders 1–9 (static curated + generated fallback)
- Pro-only modules: orders 10+ (`advanced-investing`, `real-estate`, `tax-strategy`, etc.)
- Generated modules loaded from `generated-modules.json`; static `staticModules` array in `lessons.ts` overrides by ID via the merge step
- Dashboard: pro users see ALL modules unlocked; free users see sequential lock
- Pro-only modules show `✦ PRO` badge

### AI Advisor
- Accessible only to `is_pro` users
- Route: `POST /api/ai/chat` — returns `{ text }` (plain JSON, not SSE). Body is
  `{ messages: [{role:'user'|'assistant', content}] }`; last 20 turns are sent.
- **Runs on Google Gemini** (`gemini-2.5-flash-lite` by default) via `GEMINI_API_KEY` — the
  advisor transcript is mapped to Gemini's format (`assistant` → `model`) with
  `SYSTEM_PROMPT` as the system instruction.
- Free users see upsell wall with Stripe checkout button

### AI "Explain my mistake" (wrong-answer tutor)
- After a wrong answer, a `🐙 Why was this wrong?` button appears; tapping it asks
  **Google Gemini** (free tier — `gemini-2.5-flash-lite` by default) to explain the mistake in
  ≤90 words, in the exercise's language. (Both AI endpoints — this one and the Pro
  `/chat` advisor — run on Gemini's free tier.)
- Requires `GEMINI_API_KEY` (create a free key at aistudio.google.com). Optional
  `GEMINI_MODEL` overrides the model id. If `GEMINI_API_KEY` is unset the endpoint returns
  `500 {error:'AI service not configured'}` and the button shows a "try again" message.
- **Free users get `DAILY_FREE_EXPLAINS = 3`/calendar day; Pro is unlimited.** When a
  free user runs out, the button becomes a Pro upsell (→ Stripe checkout).
- Route: `POST /api/ai/explain {context, userAnswer?}` (auth) — `context` is a compact,
  already-localized flattening of the exercise built client-side (`buildContext()` in
  `ExplainMistake.tsx`), so the endpoint stays schema-agnostic across all exercise types.
  Returns `{text, remaining, limit, unlimited}`. Quota is only decremented on a successful
  AI response (failed calls don't burn it). `403 {error:'daily_limit'}` when exhausted.
- Quota lives on `users.ai_explain_date` (YYYY-MM-DD) + `users.ai_explain_count`, reset
  lazily when the day rolls over (same pattern as the workout). `/api/auth/me` surfaces the
  derived `ai_explains_remaining` (null = unlimited/Pro).
- Frontend: reusable `<ExplainMistake exercise userAnswer? />` component. Wired into the
  wrong-answer path of every discrete-question type that pauses on a wrong answer:
  `choice`, `fill_blank` (in `ExerciseRenderer.tsx`), `true_false`, `scenario_decision`,
  `fill_number`, `stock_chart`, `portfolio_pie`, `debt_payoff`, `tax_brackets`,
  `coverage_calc`. `buildContext()` flattens each type (including the nested config
  objects like `debtPayoff`/`taxBrackets`/`coverageCalc`) into localized text for the AI.
  Not wired into auto-advancing/activity types (`sort_items`, `match_terms`, `swipe_sort`,
  `speed_round`, `boss_battle`, sliders, sims) which don't pause on a single wrong answer.
  To add to another type, render it above that component's "Continue →" button — no
  backend change needed.
- The button **hides itself when the exercise already has a built-in `explanation`**
  (`ExplainMistake` returns null in that case), so it only appears as a fallback on
  exercises that ship no written explanation. Most authored content has an explanation, so
  in practice the AI button shows only where one is missing.

## Deployment
- Render: backend + frontend as separate services
- Backend build command: `npm run build` (runs `tsc && cp src/data/generated-modules.json dist/data/generated-modules.json`)
- **`dist/` is committed to git** — always run `npm run build` in backend before committing
- Frontend: static build via Vite, `dist/` also committed

## Important Technical Notes

### AI provider (Google Gemini)
Both AI endpoints live in `backend/src/routes/ai.ts` and use the
`@google/generative-ai` SDK (non-streaming — they return `{ text }` as plain JSON):
```typescript
const gemini = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const model = gemini.getGenerativeModel({ model: GEMINI_MODEL, systemInstruction, generationConfig: { maxOutputTokens } });
const result = await model.generateContent(userMsg);        // or { contents } for multi-turn chat
const text = result.response.text();
```
For multi-turn chat, map roles: `assistant` → `model`, `user` → `user`, and pass
`{ contents: [{ role, parts: [{ text }] }] }`. The app was migrated off Anthropic;
`ANTHROPIC_API_KEY` is no longer read.

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
  Cosmetics + economy columns: `streak_freezes`, `coins`, `equipped_costume` (legacy
  single-equip, kept for backfill), `equipped_hat`, `equipped_face`, `equipped_body`
  (current per-slot equip), `chests_opened`.
  **Google sign-in column:** `google_id TEXT` (nullable, unique via partial index).
  `password_hash` is now `NULL`-able for Google-only accounts (legacy rows always
  have one). The `password_hash NOT NULL` constraint is dropped on every boot in
  `initDb()` for forward-compat.
  On boot, `initDb()` back-fills the per-slot columns from the legacy `equipped_costume`
  by joining against the catalog's `(item_id, slot)` map — only writes if the new
  column is NULL, so it's safe to run every boot.
- `pending_registrations` — unverified signups (PK `email`). Cleaned out on successful
  verification. Index on `LOWER(name)` for nickname collision checks.
- `progress` — lesson completions, `UNIQUE(user_id, lesson_id)`.
- `exercise_reviews` — spaced-repetition cards. `UNIQUE(user_id, module_id, lesson_id, exercise_id)`.
  Columns: `box_level` (1–5), `next_review_at`, `first_missed_at`, `last_reviewed_at`,
  `times_reviewed`, `times_correct`, `mastered`. Partial index on `(user_id, next_review_at) WHERE mastered = FALSE`.
- `user_inventory` — owned cosmetics. `UNIQUE(user_id, item_id)`. Item IDs are stable strings from `catalog.ts`.
- `chest_opens` — audit log of every chest pull. Columns: `reward_type`, `reward_value`, `coins_delta`, `xp_delta`, `opened_at`.
- `module_chests` — which specific positional chests a user has opened.
  `UNIQUE(user_id, module_id, position)` where `position ∈ {mid, end}`. Drives the
  `available / opened` state computed by `buildChestStates()` on `/api/chests/info`.
- `friendships` — directed friend edges. Columns: `requester_id`, `recipient_id`,
  `status` (`pending|accepted|declined`), `created_at`, `responded_at`.
  `UNIQUE(requester_id, recipient_id)` + `CHECK(requester_id <> recipient_id)`.
- `notifications` — in-app feed. Columns: `user_id`, `type`, `title`, `body`, `link`,
  `metadata JSONB`, `read BOOLEAN`, `created_at`. Index on `(user_id, read, created_at DESC)`.
- `friend_streaks` — shared streak per friend pair. PK `(user_low, user_high)` with
  `CHECK(user_low < user_high)`. Columns: `streak_count`, `best_streak`,
  `last_incr_date` (YYYY-MM-DD), `updated_at`.
- `friend_quests` — weekly co-op quest per friend pair. PK `(user_low, user_high, week_start)`
  with `CHECK(user_low < user_high)`. Columns: `goal`, `xp_low`, `xp_high`,
  `claimed_low`, `claimed_high`, `updated_at`.

### Email never blocks an API response
All `sendVerificationEmail` / `sendPasswordResetEmail` calls go through the
`fireEmail()` helper which `.catch()`-es errors. Never `await` them in a route
handler — Render-blocked SMTP can stall for 60+ seconds and freeze the user.

## Exercise System

### Exercise Types (25 total)
> Beyond the core/module-signature tables below, the newer interactive types are
> `life_sim`, `swipe_sort`, `speed_round`, `boss_battle` — documented in their own
> sections above ("Interactive exercise types" + "Life Simulation").

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

### Interactive exercise types (variety boosters)
Two newer types add tactile/timed interactions and displace overused passive
types (`choice` / `true_false`):
- **`swipe_sort`** (`SwipeSort.tsx`) — Tinder-style swipe deck. Flick cards
  left/right (or tap the side buttons) to binary-categorize. Pointer-drag with a
  90px commit threshold, per-card ✓/✗ flash + optional explanation, score at the
  end. Passing bar = at most one mistake. Config: `swipeSort {prompt, leftLabel,
  rightLabel, cards[{label, emoji?, isRight, explanation?}]}`.
- **`speed_round`** (`SpeedRound.tsx`) — timed rapid-fire. Per-question countdown
  bar (timeout = wrong), combo counter, score reveal. Pass if score ≥ `passScore`
  (default 0.6). Config: `speedRound {prompt, secondsPerQuestion?, passScore?,
  questions[{q, options[], correctIndex}]}`.
- Both registered in `ExerciseRenderer.tsx`; types mirrored in
  `frontend/src/types/index.ts` + `backend/src/data/lessons.ts`.
- **`boss_battle`** (`BossBattle.tsx`) — end-of-module capstone duel. A themed
  boss has an HP bar (= `questions.length − 2`); each correct answer deals 1
  damage, each wrong costs a heart (3 total) + reveals an explanation. Defeat the
  boss → mastery badge + fireworks + big XP; lose all hearts → retry (only victory
  calls `onAnswer(true)`, so it's a real gate). Config: `bossBattle {boss{name,
  emoji}, intro, badge{label, emoji}, questions[{q, options[], correctIndex,
  explanation?}]}`. Lives as its own short capstone LESSON at a module's end.
- **In use (kept light for variety, NOT every lesson):**
  - swipe: budgeting L1 (asset/liability), fraud L1 (scam/safe), side-hustles L1 (smart/trap)
  - speed_round: money-psychology L2, saving, investing, credit-debt, insurance, tax-strategy
  - boss_battle: investing → "The Hype Beast" 🐲, credit-debt → "The Debt Dragon" 🐉
  - untouched for contrast: budgeting L2–4, risk-management, advanced-investing, real-estate, all generated modules

### Life Simulation (`life_sim`) — flagship connected-decision lesson
A new exercise type that plays a whole financial life (age 22→60) as ONE
connected experience with persistent state, instead of isolated questions.
- Component: `frontend/src/components/exercises/LifeSimulation.tsx`. State carried
  across stages: `cash`, `investments`, `debt`, `monthlySurplus`, `monthlyInvest`,
  `happiness`, `wisdom`. A persistent stats dashboard (age / net worth / invested /
  debt) updates as you go.
- Each stage = a scenario + choices. Choosing applies immediate deltas
  (`cashDelta`, `investDelta`, `debtDelta`, `monthlySurplusDelta`,
  `monthlyInvestDelta`, `investMultiplier` for crashes, `cashOutInvestments` flag),
  shows an outcome, then **`{yearsToNext} years later →`** advances time:
  investments compound (lump + monthly-contribution future value at `annualReturn`),
  idle surplus piles into cash, unpaid debt grows at `debtApr`.
- Ends on a payoff reveal: net worth headline + invested/cash/debt breakdown +
  a tiered ending title (`endings[]` by `minNetWorth`) + fireworks for a great run,
  then `onAnswer(true, xp)`.
- Config type `LifeSimConfig` lives in BOTH `frontend/src/types/index.ts` and
  `backend/src/data/lessons.ts`. Registered in `ExerciseRenderer.tsx`.
- First instance: the **"Your Money Life"** capstone lesson (`money-life-sim`) at the
  end of the **budgeting** module — theory intro + a 7-stage simulation.

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
- `GET /info` — `{chests: [{moduleId, position, afterLessonIdx, status}…], available, opened, total, recentOpens[]}`
- `POST /open {moduleId, position}` — atomically draws + applies a reward,
  returns `{reward, item, coinsDelta, xpDelta, moduleId, position}`. (Coins/item
  deltas always 0 today since pool is XP-only, but the fields are kept for the
  audit log + ChestModal's coin/cosmetic UI branches that handle legacy `chest_opens` rows.)

Shop (`/api/shop/*`):
- `GET /catalog` — all items with per-item `{owned, equipped}` + `equipped: {hat, face, body}`
- `GET /inventory` — items the user owns
- `POST /buy {itemId}` — −price coins, +inventory row
- `POST /equip {itemId}` — sets the slot column matching `catalog[itemId].slot`
- `POST /unequip {slot}` — clears `equipped_hat | equipped_face | equipped_body`
- `POST /exchange {xpAmount}` — −XP / +coins at rate `XP_PER_COIN_EXCHANGE_RATE`

Friends (`/api/friends/*`):
- `GET /list` — accepted friends with stats
- `GET /pending` — `{incoming[], outgoing[]}`
- `GET /search?q=` — up to 10 users matching name, excludes self, includes friendship status
- `GET /preview/:id` — full snapshot for `UserProfileModal` (mascot, stats, friendship status)
- `POST /request {targetUserId | targetName}` — auto-accepts if mutual pending
- `POST /accept {requestId}`, `POST /decline {requestId}`, `POST /cancel {requestId}`
- `POST /remove {friendUserId}` — unfriend
- `GET /quests` — this week's co-op quests (combined XP progress per friend)
- `POST /quests/claim {friendId}` — claim the co-op reward once the shared goal is met

Notifications (`/api/notifications/*`):
- `GET /` — last 30, newest first
- `GET /unread-count`
- `POST /:id/read`, `POST /read-all`

AI (`/api/ai/*`):
- `POST /chat` — Pro-only advisor (Haiku)
- `POST /explain {context, userAnswer?}` — wrong-answer tutor; free quota `DAILY_FREE_EXPLAINS`/day, Pro unlimited

Other: `/api/stripe/*` (checkout + webhook), `/api/generate/*` (AI lesson generation)

## Languages
- App supports English (`en`) and Bulgarian (`bg`)
- `useLang()` hook provides `{ ui, lang, setLang }`
- Always add both language strings when adding user-facing text
