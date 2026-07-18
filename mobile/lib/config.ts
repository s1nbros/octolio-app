import { Platform } from 'react-native';

/**
 * Backend base URL. The mobile app never touches Postgres directly — it talks to
 * the SAME Express backend the web app uses, which owns the Neon database. That
 * keeps DB credentials + all auth/validation on the server.
 *
 * Resolution order:
 *  1. EXPO_PUBLIC_API_URL  — set this for device testing + production builds.
 *  2. Dev default          — a local backend (which is wired to Neon via backend/.env):
 *       • iOS simulator      → http://localhost:3001
 *       • Android emulator   → http://10.0.2.2:3001
 *       • Physical device    → localhost won't reach your Mac; set EXPO_PUBLIC_API_URL
 *                              to your LAN IP, e.g. http://192.168.1.20:3001
 *  3. Production fallback   — the deployed backend (update once you know its URL).
 */
const ENV_URL = process.env.EXPO_PUBLIC_API_URL;

// The deployed backend (owns the Neon database). This is the default so the app
// connects to real data out of the box — on a simulator or a physical device.
// To test against a LOCAL backend instead, set EXPO_PUBLIC_API_URL, e.g.:
//   iOS sim → http://localhost:3001 · Android emu → http://10.0.2.2:3001
//   device  → http://<your-LAN-IP>:3001
const PROD_DEFAULT = 'https://octolio-app-2.onrender.com';

export const API_BASE_URL = ENV_URL || PROD_DEFAULT;

/** The web app — used for the subscription flow and legal pages. */
export const WEB_APP_URL = 'https://octolio.me';

/**
 * COMPLIANCE FLAG — whether to show the "Upgrade to Pro" action that sends the
 * user to the web app to subscribe.
 *
 * Apple guideline 3.1.1/3.1.3 (anti-steering) historically PROHIBITS linking out
 * to buy a digital subscription from inside an iOS app — it's the #1 rejection
 * reason. Recent US (Epic ruling) + EU (DMA) changes have loosened this, but to
 * be safe we DEFAULT IT OFF on iOS. Flip to `true` only once you've confirmed
 * your store account is enrolled for external-purchase links, or keep Pro purely
 * a web purchase. Android is more permissive, so it's on there.
 */
export const SHOW_PRO_UPGRADE = Platform.OS !== 'ios';

export const PRIVACY_URL = `${WEB_APP_URL}/privacy`;
export const TERMS_URL = `${WEB_APP_URL}/terms`;
