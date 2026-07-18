/**
 * Octolio brand palette — the EXACT values from the web app's dark theme
 * (frontend/src/index.css). React Native accepts hsl()/hsla()/rgba() strings,
 * so we mirror them 1:1 for a pixel-matched look.
 */
export const colors = {
  bg: 'hsl(270, 18%, 9%)',
  bgCard: 'hsl(270, 16%, 13%)',
  card: 'hsl(270, 16%, 13%)',
  bgElevated: 'hsl(270, 16%, 17%)',

  fg: 'hsl(268, 5%, 97%)',
  fgMuted: 'hsl(268, 5%, 76%)',
  fgSubtle: 'hsl(268, 6%, 56%)',

  border: 'rgba(160,140,220,0.13)',
  borderSoft: 'rgba(160,140,220,0.13)',
  borderStrong: 'rgba(160,140,220,0.22)',

  primary: 'hsl(258, 65%, 68%)',
  primarySoft: 'hsla(258, 65%, 68%, 0.15)',
  green: 'hsl(162, 52%, 62%)',
  greenSoft: 'hsla(162, 52%, 62%, 0.15)',
  orange: 'hsl(32, 78%, 58%)',
  orangeSoft: 'hsla(32, 78%, 58%, 0.15)',
  purple: 'hsl(280, 60%, 66%)',
  red: 'hsl(10, 72%, 62%)',
  redSoft: 'hsla(10, 72%, 62%, 0.12)',

  glass: 'rgba(255,255,255,0.04)',
  white: '#ffffff',
};

/** Per-module color palettes for the snake-path banners + lesson nodes
 *  (mirrors Modules.tsx `COLORS`). Each = [main, deep, soft] for gradients. */
export const modulePalettes: Record<string, { main: string; deep: string; soft: string }> = {
  green: { main: 'hsl(160, 55%, 55%)', deep: 'hsl(160, 60%, 35%)', soft: 'hsl(160, 55%, 70%)' },
  blue: { main: 'hsl(239, 84%, 67%)', deep: 'hsl(239, 70%, 45%)', soft: 'hsl(239, 84%, 78%)' },
  purple: { main: 'hsl(280, 70%, 65%)', deep: 'hsl(280, 55%, 42%)', soft: 'hsl(280, 70%, 78%)' },
  orange: { main: 'hsl(28, 85%, 60%)', deep: 'hsl(28, 80%, 40%)', soft: 'hsl(28, 85%, 72%)' },
};
export const LOCKED_PALETTE = { main: 'hsl(228, 12%, 30%)', deep: 'hsl(228, 14%, 18%)', soft: 'hsl(228, 12%, 40%)' };

export const radius = { sm: 10, md: 14, lg: 20, xl: 26, pill: 999 };
export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 };
