# Octolio — Lesson/Module Generation Discussion

A working log of the conversation around AI-generated lessons and the
19 hand-authored modules.

---

## 1. Original goal

Build a Duolingo-style finance learning app where every module has:

- 1 theory exercise (2–3 rich slides, sourced from real finance content)
- ≥ 7 interactive exercises (mix of at least 4 types)
- Bilingual content (`en` + `bg`)
- No repeated exercises across generations

---

## 2. What got built

### `backend/src/services/lessonGenerator.ts`
Core generation service.

- `fetchTheorySeed(topic)` → pulls a short factual blurb from
  `https://en.wikipedia.org/api/rest_v1/page/summary/<topic>` (free, keyless).
- `authorLesson(topic, seed, avoid)` → asks Claude (`claude-opus-4-7`,
  `max_tokens: 8000`) to produce one Lesson JSON matching the existing
  `Lesson`/`Exercise` schema.
- `dedupe(lesson)` → SHA-1 fingerprints each exercise (`type` + salient
  text) and rejects ones already seen in this process.
- `validate(lesson)` → enforces the hard rules (first must be `theory`,
  ≥ 7 non-theory, ≥ 4 distinct non-theory types).
- `generateModule(spec)` → loops over `lessonTopics` and produces a
  full `Module`.

### `backend/src/routes/generate.ts`
`POST /api/generate/lesson` (auth-protected) — body `{ topic }`,
returns a freshly generated `Lesson`.

### `frontend/src/pages/GeneratedLesson.tsx`
Topic input → calls `/api/generate/lesson` → renders the lesson with
the existing `ExerciseRenderer`. Wired into `App.tsx` at `/generate`.

### `backend/src/scripts/generateProModules.ts`
One-off script that produced 2 pro-only modules (crypto, retirement)
using `generateModule()` and wrote them to `generated-modules.json`.

### `backend/src/scripts/generateAllModules.ts`
Bigger script with 19 specs (3 recreated free + 5 new free + 3
recreated pro + 8 new pro), with resume support — writes the JSON
after each module so partial runs aren't lost.

---

## 3. The static-content pivot

Halfway through, you asked to **stop regenerating every time** and
just save the modules once. We dropped the API-based approach and
hand-wrote all 19 modules directly into
`backend/src/data/generated-modules.json` across four batches.

### Final catalog (20 modules total)

**Free plan (8):**

| order | id              | source        |
| ----- | --------------- | ------------- |
| 1     | budgeting       | static (kept) |
| 2     | saving          | JSON          |
| 3     | investing       | JSON          |
| 4     | credit-debt     | JSON          |
| 5     | side-hustles    | JSON          |
| 6     | insurance       | JSON          |
| 7     | risk-management | JSON          |
| 8     | smart-shopping  | JSON          |
| 9     | money-mindset   | JSON          |

**Pro plan (11):**

| order | id                      |
| ----- | ----------------------- |
| 10    | advanced-investing      |
| 11    | real-estate             |
| 12    | tax-strategy            |
| 13    | crypto                  |
| 14    | retirement              |
| 15    | stock-picking           |
| 16    | options-derivatives     |
| 17    | estate-planning         |
| 18    | entrepreneurship        |
| 19    | international-investing |
| 20    | macro-cycles            |

Every module = 1 lesson with 1 theory (2 slides) + 7 interactive
exercises mixing `choice`, `fill_blank`, `sort_items`,
`rpg_scenario`, occasionally `compound_sim`. All text in `en` + `bg`.

---

## 4. How loading works

`backend/src/data/lessons.ts`:

```ts
let generatedModules: Module[] = [];
try {
  generatedModules = require('./generated-modules.json') as Module[];
} catch { /* no generated file yet */ }

const staticModules: Module[] = [ /* hand-written budgeting, etc. */ ];

// Merge: generated overrides static by id
const byId = new Map<string, Module>();
for (const m of staticModules) byId.set(m.id, m);
for (const m of generatedModules) byId.set(m.id, m);
export const modules: Module[] = [...byId.values()].sort((a, b) => a.order - b.order);
```

Pro gating happens in `routes/modules.ts` — pro users see everything,
free users get only `proOnly: false`.

To revert to the original hand-written catalog: delete
`generated-modules.json` and restart.

---

## 5. The "I don't see the new modules" issue

**Root cause:** the Octolio backend was not running. Port `3001` was
held by a `node (npx remotion studio)` process from another project,
so every `/api/...` request returned Remotion's HTML.

### Fix

```bash
# 1. Kill whatever is on 3001
lsof -nP -iTCP:3001 -sTCP:LISTEN
kill 38284   # use the PID from the line above

# 2. Start the Octolio backend
cd /Users/mikhailsinigerov/Documents/Octolio-app/octolio-app/backend
npm run dev
# expect: 🚀 Octolio backend running on http://localhost:3001

# 3. (optional) sanity-check
curl -s http://localhost:3001/api/health
```

Then refresh the frontend (Vite proxies `/api` → `localhost:3001`)
and all 20 modules will appear, gated correctly by plan.

---

## 6. Files touched

- `backend/src/services/lessonGenerator.ts` — created
- `backend/src/routes/generate.ts` — created
- `backend/src/index.ts` — mounts `/api/generate`
- `backend/src/data/lessons.ts` — merge logic
- `backend/src/data/generated-modules.json` — 19 modules, ~2,517 lines
- `backend/src/scripts/generateProModules.ts` — created (one-off)
- `backend/src/scripts/generateAllModules.ts` — created (one-off)
- `backend/package.json` — added `@anthropic-ai/sdk`
- `frontend/src/pages/GeneratedLesson.tsx` — created
- `frontend/src/App.tsx` — added `/generate` route
