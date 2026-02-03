import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
        rajdhani: ['var(--font-rajdhani)', 'sans-serif'],
      },
      colors: {
        primary: '#00d4ff',
        'primary-dark': '#0099cc',
        secondary: '#ff6b35',
        gold: '#ffd700',
        accent: '#00ff88',
        'bg-dark': '#050810',
        'bg-panel': '#0a0f1a',
        'bg-card': '#0d1428',
        border: '#1a2545',
        'text-muted': '#5080b0',
      },
      animation: {
        rotate: 'rotate 60s linear infinite',
        float: 'float 3s ease-in-out infinite',
        pulseGlow: 'pulseGlow 1.5s ease-in-out infinite',
        idleFloat: 'idleFloat 4s ease-in-out infinite',
        glowPulse: 'glowPulse 3s ease-in-out infinite',
        selectedPulse: 'selectedPulse 1s ease infinite',
        p1Flash: 'p1Flash 0.5s ease infinite alternate',
        timerPulse: 'timerPulse 0.5s ease infinite',
        shake: 'shake 0.3s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        slideUp: 'slideUp 0.5s ease-out',
      },
      keyframes: {
        rotate: {
          from: { transform: 'translate(-50%, -50%) rotate(0deg)' },
          to: { transform: 'translate(-50%, -50%) rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': {
            opacity: '1',
            textShadow: '0 0 20px #00d4ff',
          },
          '50%': {
            opacity: '0.4',
            textShadow: '0 0 5px #00d4ff',
          },
        },
        idleFloat: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-8px) scale(1.01)' },
        },
        glowPulse: {
          '0%, 100%': {
            opacity: '0.6',
            transform: 'translateX(-50%) scale(1)',
          },
          '50%': {
            opacity: '1',
            transform: 'translateX(-50%) scale(1.1)',
          },
        },
        selectedPulse: {
          '0%, 100%': {
            boxShadow:
              '0 0 30px rgba(0, 212, 255, 0.6), inset 0 0 20px rgba(0, 212, 255, 0.1)',
          },
          '50%': {
            boxShadow:
              '0 0 40px rgba(0, 212, 255, 0.8), inset 0 0 30px rgba(0, 212, 255, 0.2)',
          },
        },
        p1Flash: {
          from: { opacity: '1' },
          to: { opacity: '0.7' },
        },
        timerPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px) rotate(-0.5deg)' },
          '40%': { transform: 'translateX(8px) rotate(0.5deg)' },
          '60%': { transform: 'translateX(-4px) rotate(-0.3deg)' },
          '80%': { transform: 'translateX(4px) rotate(0.3deg)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
