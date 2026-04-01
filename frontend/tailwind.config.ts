import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'hsl(228, 24%, 8%)',
          card: 'hsl(228, 24%, 11%)',
          elevated: 'hsl(224, 20%, 14%)',
        },
        fg: {
          DEFAULT: 'hsl(210, 40%, 96%)',
          muted: 'hsl(215, 20%, 65%)',
        },
        primary: {
          DEFAULT: 'hsl(239, 84%, 67%)',
          hover: 'hsl(239, 84%, 72%)',
          dim: 'hsl(239, 84%, 67%, 0.15)',
        },
        green: {
          brand: 'hsl(160, 55%, 55%)',
          'brand-hover': 'hsl(160, 55%, 62%)',
          'brand-dim': 'hsl(160, 55%, 55%, 0.15)',
          'brand-muted': 'hsl(160, 40%, 40%)',
        },
        orange: {
          brand: 'hsl(28, 85%, 60%)',
          'brand-dim': 'hsl(28, 85%, 60%, 0.15)',
        },
        purple: {
          brand: 'hsl(280, 70%, 65%)',
          'brand-dim': 'hsl(280, 70%, 65%, 0.15)',
        },
        danger: 'hsl(0, 72%, 58%)',
        border: 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.05)',
        'glass-hover': '0 12px 40px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.08)',
        glow: '0 0 24px rgba(99, 102, 241, 0.25)',
        'glow-green': '0 0 24px hsl(160, 55%, 55%, 0.3)',
      },
      keyframes: {
        'orb-float-1': {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '25%': { transform: 'translate(80px,-60px) scale(1.1)' },
          '50%': { transform: 'translate(-40px,-120px) scale(0.95)' },
          '75%': { transform: 'translate(60px,-40px) scale(1.05)' },
        },
        'orb-float-2': {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '25%': { transform: 'translate(-100px,50px) scale(1.08)' },
          '50%': { transform: 'translate(60px,80px) scale(0.92)' },
          '75%': { transform: 'translate(-50px,-30px) scale(1.04)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-right': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'xp-pop': {
          '0%': { opacity: '0', transform: 'scale(0.5) translateY(0)' },
          '50%': { opacity: '1', transform: 'scale(1.2) translateY(-10px)' },
          '100%': { opacity: '0', transform: 'scale(1) translateY(-30px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'heart-break': {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.3)' },
          '50%': { transform: 'scale(0.8) rotate(-10deg)' },
          '75%': { transform: 'scale(1.1) rotate(5deg)' },
          '100%': { transform: 'scale(1) rotate(0)' },
        },
      },
      animation: {
        'orb-1': 'orb-float-1 18s ease-in-out infinite',
        'orb-2': 'orb-float-2 22s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.35s ease-out both',
        'slide-right': 'slide-right 0.4s ease-out both',
        'xp-pop': 'xp-pop 1.2s ease-out both',
        shimmer: 'shimmer 2s linear infinite',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        'heart-break': 'heart-break 0.5s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
