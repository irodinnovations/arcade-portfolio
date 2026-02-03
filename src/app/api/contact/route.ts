import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import {
  sanitizeText,
  isValidEmail,
  isValidName,
  isValidMessage,
  hashIP,
} from '@/lib/security';
import { sendContactEmail } from '@/lib/email';

// Rate limiter: 3 submissions per hour per IP
const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(3, '1 h'),
        analytics: true,
      })
    : null;

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') ?? 'unknown';

    // 1. Rate limiting (if configured)
    if (ratelimit) {
      const { success, remaining } = await ratelimit.limit(ip);

      if (!success) {
        console.warn(`[CONTACT] Rate limited: ${hashIP(ip)}`);
        return NextResponse.json(
          { error: 'Too many requests. Try again later.' },
          { status: 429 }
        );
      }

      // Log with hashed IP for privacy
      console.warn(`[CONTACT] Submission received`, {
        ip: hashIP(ip),
        timestamp: new Date().toISOString(),
        remaining,
      });
    }

    const body = await request.json();

    // 2. Honeypot check (hidden field should be empty)
    if (body.website) {
      console.warn(`[CONTACT] Honeypot triggered: ${hashIP(ip)}`);
      // Return success to fool bots
      return NextResponse.json({ success: true });
    }

    // 3. Server-side validation
    const { name, email, message } = body;

    if (!isValidName(name)) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    if (!isValidMessage(message)) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    // 4. Sanitize
    const sanitized = {
      name: sanitizeText(name),
      email: email.toLowerCase().trim(),
      message: sanitizeText(message),
    };

    // 5. Send email
    try {
      await sendContactEmail(sanitized);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('[CONTACT] Send failed:', error);
      return NextResponse.json(
        { error: 'Failed to send. Try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[CONTACT] Request error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
