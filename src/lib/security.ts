import { createHash } from 'crypto';

/**
 * Sanitize text by removing HTML tags and trimming
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 2000);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Hash IP address for logging (no PII in logs)
 */
export function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

/**
 * Validate name field
 */
export function isValidName(name: string): boolean {
  return (
    typeof name === 'string' && name.length >= 1 && name.length <= 100
  );
}

/**
 * Validate message field
 */
export function isValidMessage(message: string): boolean {
  return (
    typeof message === 'string' && message.length >= 1 && message.length <= 2000
  );
}
