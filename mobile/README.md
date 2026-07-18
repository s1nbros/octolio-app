# Octolio Mobile (Expo / React Native)

Native iOS + Android app for Octolio. It reuses the **same backend API** as the web
app (`octolio-app/backend`) — this project is only the mobile frontend.

## Stack
- Expo SDK 54 (managed workflow) + Expo Router 6 (file-based navigation)
- TypeScript, React Native 0.81, React 19
- Auth token stored in `expo-secure-store`
- Builds & store submission via **EAS** (`eas build`, `eas submit`)

## Run it
```bash
cd octolio-app/mobile
npm install            # or: npx expo install  (aligns versions to the SDK)
npx expo start         # press i (iOS sim), a (Android emulator), or scan QR in Expo Go
```

### Pointing at a backend (the DB connection)
The app never talks to Postgres directly — it calls the **shared Express backend**,
which owns the Neon database. So "connect the database" = point the app at a backend.

Set `EXPO_PUBLIC_API_URL` (copy `.env.example` → `.env`). If unset, `lib/config.ts`
falls back to a sensible dev default:
- iOS simulator + local backend → `http://localhost:3001`
- Android emulator + local backend → `http://10.0.2.2:3001`
- **Physical device** + local backend → set `EXPO_PUBLIC_API_URL=http://<your-LAN-IP>:3001`
- Production → set `EXPO_PUBLIC_API_URL` to your deployed backend URL

Run the backend locally (`cd ../backend && npm run dev`) — it's wired to Neon via
`backend/.env`, so the app then reads/writes real data.

## Building for the stores
```bash
npm i -g eas-cli && eas login
eas build:configure
eas build --platform ios       # or android, or all
eas submit --platform ios      # after the build finishes
```
Set up an Apple Developer account + App Store Connect app, and a Google Play
console app, with bundle id / package `me.octolio.app` (see `app.json`).

## Store-compliance checklist (in progress)
- [x] **Account deletion in-app** — Profile → Delete account (Apple 5.1.1(v)); backend `DELETE /api/auth/account`.
- [x] **No in-app purchase of digital goods** — Pro upsell is hidden on iOS by default (`SHOW_PRO_UPGRADE` in `lib/config.ts`). See the note there before enabling web-checkout links on iOS (anti-steering, Apple 3.1.1/3.1.3).
- [x] **Email/password only auth** — avoids Apple's "Sign in with Apple required" rule (4.8). If you add Google sign-in, you MUST also add Sign in with Apple.
- [ ] **Loot-box odds disclosure** — Wheel of Luck + chests need visible odds if surfaced in the app (both stores). Not yet in the mobile app.
- [ ] **Privacy policy + data-safety forms** — link exists (`PRIVACY_URL`); fill Apple privacy labels + Google Data safety at submission.
- [ ] **App icon + splash** — add `assets/` and reference in `app.json` before building.
- [ ] Push notifications, deep links, and the richer exercise/feature set are follow-ups.

## Current scope
Auth (login / register / email verify), module list, lesson runner
(theory / choice / true_false / fill_blank / fill_number / scenario_decision, with
a graceful fallback for richer types), streak + energy, a **Portfolio** tab
(virtual trading against the same `/api/portfolio` backend), and a profile with
account deletion.

Still to port for full web parity: onboarding wizard, shop / chests / wheel,
friends + quests, AI coach + "explain my mistake", test-out, daily workout, and
the remaining interactive exercise types (drag-sort, sliders, sims, boss battles).
