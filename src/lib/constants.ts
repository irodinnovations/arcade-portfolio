// Design tokens
export const colors = {
  primary: '#00d4ff',
  primaryDark: '#0099cc',
  secondary: '#ff6b35',
  gold: '#ffd700',
  accent: '#00ff88',
  bgDark: '#050810',
  bgPanel: '#0a0f1a',
  bgCard: '#0d1428',
  border: '#1a2545',
  text: '#ffffff',
  textMuted: '#5080b0',
} as const;

// Social links
export const socialLinks = {
  linkedin: 'https://www.linkedin.com/in/rodney-john',
  substack: 'https://vibecodersdispatch.substack.com',
  omr: 'https://omrnewsletter.substack.com',
} as const;

// Site metadata
export const siteConfig = {
  name: 'Rodney John',
  title: 'Rodney John | Project Select',
  description:
    'Strategic Operations Leader with 10+ years driving performance. Builder, automation enthusiast, and innovation partner.',
  url: 'https://rodneyjohn.com',
  ogImage: '/images/og-image.png',
  twitterHandle: '@rodneyjohn',
} as const;

// Timer settings
export const TIMER_DURATION = 99;
export const TIMER_WARNING_THRESHOLD = 10;

// Easter egg - arcade route
export const ARCADE_URL = '/arcade';

// Konami code sequence
export const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
] as const;
