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
- **Auth**: JWT tokens
- **AI**: Anthropic SDK v0.30.x — SSE streaming

## Project Structure
```
octolio-app/
  backend/
    src/
      data/
        lessons.ts          — all module/lesson data (static + generated merged)
        generated-modules.json  — 19 generated modules loaded at runtime
      routes/
        auth.ts             — login, register, /me (auto energy refill here)
        progress.ts         — lesson completion, energy deduction
        ai.ts               — AI advisor SSE endpoint (Pro-only)
        stripe.ts           — Stripe checkout + webhook
      middleware/auth.ts    — JWT authenticate middleware
      db.ts                 — exports getPool()
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
      components/
        Navbar.tsx          — energy pill (clickable popover), pro badge, nav tabs
        ExerciseRenderer.tsx — renders exercise types
        ModuleCard.tsx
        FloatingOrbs.tsx
      contexts/
        AuthContext.tsx      — user state, updateUser, refreshUser
        LanguageContext.tsx  — EN/BG
        ThemeContext.tsx
      types/index.ts         — User, Module, Lesson, Exercise types
```

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

## Languages
- App supports English (`en`) and Bulgarian (`bg`)
- `useLang()` hook provides `{ ui, lang, setLang }`
- Always add both language strings when adding user-facing text
