# Arcade Portfolio v2

A modern, production-grade portfolio website built with Next.js 16, TypeScript, and Tailwind CSS. Features a Virtua Fighter-inspired arcade aesthetic with full accessibility support.

## 🎮 Features

- **Next.js 16** with TypeScript strict mode
- **Tailwind CSS 4** for styling
- **Arcade aesthetic** with CRT overlay, scanlines, and retro animations
- **Full accessibility** - semantic HTML, skip links, keyboard navigation, ARIA labels
- **Reduced motion support** - respects `prefers-reduced-motion`
- **Security headers** - CSP, HSTS, X-Frame-Options, etc.
- **Contact form** with honeypot + rate limiting (Upstash) + email sending (Resend)
- **Optimized assets** - WebP images, ~752KB total

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## 📦 Deployment (Vercel)

### 1. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import from GitHub: `irodinnovations/arcade-portfolio`
3. Framework preset: **Next.js** (auto-detected)

### 2. Configure Environment Variables

Add these in the Vercel dashboard → Project → Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis token |
| `RESEND_API_KEY` | Yes (production) | Resend API key for email |
| `CONTACT_EMAIL` | Yes (production) | Email to receive contact form submissions |

### 3. Configure Domain

1. Vercel Dashboard → Project → Settings → Domains
2. Add `rodneyjohn.com`
3. Follow DNS configuration instructions

### 4. Verify Security Headers

After deployment, check: https://securityheaders.com/?q=rodneyjohn.com

**Target grade: A+**

## 🧪 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run format       # Prettier format
npm run format:check # Prettier check
```

## 📁 Project Structure

```
arcade-portfolio-v2/
├── public/
│   ├── images/
│   │   ├── mascots/     # Project mascot images (WebP)
│   │   └── game/        # Easter egg game assets
│   └── audio/           # Voice files
├── src/
│   ├── app/
│   │   ├── api/contact/ # Contact form endpoint
│   │   ├── layout.tsx   # Root layout
│   │   └── page.tsx     # Main page
│   ├── components/
│   │   ├── ui/          # Button, Badge, SoundToggle
│   │   ├── layout/      # SkipLink
│   │   ├── screens/     # StartScreen, SelectScreen
│   │   ├── roster/      # RosterGrid, RosterCard
│   │   ├── mascot/      # MascotDisplay
│   │   ├── effects/     # CRTOverlay, Background, FlashOverlay
│   │   └── forms/       # ContactForm
│   ├── hooks/           # useAudio, useKeyboard, useReducedMotion
│   └── lib/             # projects, constants, security, email
└── scripts/             # Image optimization
```

## 🔒 Security

- **CSP** - Content Security Policy configured
- **HSTS** - HTTP Strict Transport Security with preload
- **Rate limiting** - 3 requests/hour/IP on contact form
- **Honeypot** - Hidden field to catch bots
- **Input sanitization** - Server-side validation and sanitization
- **No PII logging** - IP addresses are hashed

## ♿ Accessibility

- Semantic HTML (`<main>`, `<nav>`, `<header>`, `<footer>`)
- Skip link for keyboard users
- ARIA labels on interactive elements
- Focus visible indicators
- Keyboard navigation (←/→/Enter)
- Reduced motion support
- Color contrast compliant

## 📊 Lighthouse Targets

| Metric | Target |
|--------|--------|
| Performance | ≥90 |
| Accessibility | ≥95 |
| Best Practices | 100 |
| SEO | 100 |

## 🎯 Future Improvements

- [ ] Easter egg game (full implementation)
- [ ] Vercel Analytics integration
- [ ] CI workflow (requires token with workflow scope)
- [ ] OG image generation
- [ ] Favicon set generation
