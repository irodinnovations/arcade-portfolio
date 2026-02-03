# Deployment Checklist

## Pre-Deployment

- [x] Build passes (`npm run build`)
- [x] TypeScript strict mode enabled
- [x] ESLint passes (`npm run lint`)
- [x] Security headers configured in `next.config.ts`
- [x] Images optimized to WebP (752KB total)
- [x] Accessibility features implemented
- [x] Reduced motion support

## Vercel Deployment Steps

### 1. Connect Repository

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select `irodinnovations/arcade-portfolio`
4. Click "Import"

### 2. Configure Project

- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `.` (leave blank)
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

### 3. Environment Variables

Add in Vercel Dashboard → Settings → Environment Variables:

```
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
RESEND_API_KEY=your_resend_api_key
CONTACT_EMAIL=your_email@example.com
```

### 4. Deploy

Click "Deploy" and wait for the build to complete.

### 5. Configure Domain

1. Go to Project → Settings → Domains
2. Add `rodneyjohn.com`
3. Add `www.rodneyjohn.com` (redirect to apex)
4. Follow Vercel's DNS configuration instructions

### 6. Enable Analytics

1. Go to Project → Analytics
2. Click "Enable"
3. Done (no code changes needed)

## Post-Deployment Verification

### Security Headers

Check: https://securityheaders.com/?q=rodneyjohn.com

Expected headers:
- ✅ Content-Security-Policy
- ✅ Strict-Transport-Security
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ Referrer-Policy
- ✅ Permissions-Policy

Target grade: **A+**

### Lighthouse Audit

Run in Chrome DevTools → Lighthouse:
- Performance: ≥90
- Accessibility: ≥95
- Best Practices: 100
- SEO: 100

### Functional Testing

- [ ] Press Start works
- [ ] Project selection with keyboard (←/→/Enter)
- [ ] Project selection with mouse/touch
- [ ] Launch buttons work for live projects
- [ ] GitHub buttons work where applicable
- [ ] Sound toggle persists across sessions
- [ ] Timer counts down and resets
- [ ] Mobile layout works
- [ ] Reduced motion preference respected

## Environment Variables Reference

| Variable | Scope | Description |
|----------|-------|-------------|
| `UPSTASH_REDIS_REST_URL` | Server only | Redis connection URL |
| `UPSTASH_REDIS_REST_TOKEN` | Server only | Redis auth token |
| `RESEND_API_KEY` | Server only | Email API key |
| `CONTACT_EMAIL` | Server only | Recipient for contact form |

**Note:** None of these should have `NEXT_PUBLIC_` prefix - they are server-side only.

## Upstash Setup (for rate limiting)

1. Go to https://console.upstash.com
2. Create a new Redis database
3. Copy REST URL and REST Token
4. Add to Vercel environment variables

## Resend Setup (for contact form emails)

1. Go to https://resend.com
2. Create account and verify domain (or use default)
3. Get API key
4. Add to Vercel environment variables
