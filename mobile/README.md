# Octolio Mobile (Expo / React Native)

Native iOS + Android app for Octolio. It reuses the **same backend API** as the web
app (`octolio-app/backend`) — this project is only the mobile frontend.

## Stack
- Expo SDK 52 (managed workflow) + Expo Router (file-based navigation)
- TypeScript, React Native 0.76
- Auth token stored in `expo-secure-store`
- Builds & store submission via **EAS** (`eas build`, `eas submit`)

## Run it
```bash
cd octolio-app/mobile
npm install            # or: npx expo install  (aligns versions to the SDK)
npx expo start         # press i (iOS sim), a (Android emulator), or scan QR in Expo Go
```

### Pointing at a backend
Edit `lib/config.ts` → `API_BASE_URL`:
- Production: the Render backend (default).
- iOS simulator (local backend): `http://localhost:3001`
- Android emulator (local backend): `http://10.0.2.2:3001`
- Physical device (local backend): your machine's LAN IP, e.g. `http://192.168.1.20:3001`

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

## v1 scope (this build)
Auth (login / register / email verify), module list, a lesson runner
(theory / choice / true_false / fill_blank with a graceful fallback for richer
types), streak + energy, and a profile with account deletion. Everything else
(shop, chests, wheel, friends, portfolio, AI coach, all 25 exercise types) is a
follow-up.
