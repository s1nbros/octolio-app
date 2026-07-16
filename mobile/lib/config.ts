import { Platform } from 'react-native';

/**
 * Backend base URL. The mobile app reuses the exact same API as the web app.
 *
 * - Production: the deployed Render backend.
 * - Local dev on a SIMULATOR: http://localhost:3001 works on iOS sim; Android
 *   emulator must use http://10.0.2.2:3001.
 * - Local dev on a PHYSICAL device: use your computer's LAN IP, e.g.
 *   http://192.168.1.20:3001 (localhost points at the phone itself).
 */
export const API_BASE_URL = 'https://octolio-backend.onrender.com';

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
