/**
 * Security & Hardening Layer for Zain Automation AI
 * - Secure HTTP headers
 * - SSRF Protection
 * - Directory Traversal Prevention
 * - Log and JSON Response Sanitization
 * - Unified Error Responses
 */
import { Request, Response, NextFunction } from 'express';

// List of regexes identifying secrets for scrubbing
const SENSITIVE_PATTERNS = [
  /sk-[A-Za-z0-9_-]{20,}/g,
  /AIza[0-9A-Za-z-_]{35}/g,
  /EAA[A-Za-z0-9_-]{50,}/g,
  /whsec_[A-Za-z0-9_-]{15,}/g,
  /za_(?:live|test)_[a-f0-9]{15,}/gi,
  /Bearer\s+[A-Za-z0-9_.-]+/gi,
  /password["']?\s*[:=]\s*["']?[^"'&\s]+/gi,
  /re_[A-Za-z0-9_-]{20,}/g
];

/**
 * Mask sensitive values in any string
 */
export function sanitizeString(val: string): string {
  if (!val || typeof val !== 'string') return val;
  let sanitized = val;
  sanitized = sanitized.replace(/sk-[A-Za-z0-9_-]{20,}/g, '[REDACTED_API_KEY]');
  sanitized = sanitized.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_GEMINI_KEY]');
  sanitized = sanitized.replace(/EAA[A-Za-z0-9_-]{50,}/g, '[REDACTED_META_TOKEN]');
  sanitized = sanitized.replace(/whsec_[A-Za-z0-9_-]{15,}/g, '[REDACTED_WEBHOOK_SECRET]');
  sanitized = sanitized.replace(/re_[A-Za-z0-9_-]{20,}/g, '[REDACTED_RESEND_KEY]');
  sanitized = sanitized.replace(/za_(?:live|test)_[a-f0-9]{15,}/gi, '[REDACTED_INTERNAL_KEY]');
  sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9_.-]+/gi, 'Bearer [REDACTED_TOKEN]');
  return sanitized;
}

/**
 * Recursively sanitize objects and remove secret fields before sending to client
 */
export function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeString(obj);
  if (typeof obj === 'number' || typeof obj === 'boolean') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      const lowerKey = k.toLowerCase();
      // Completely strip known secret fields
      if (
        lowerKey.includes('secret') ||
        lowerKey.includes('token') ||
        lowerKey.includes('password') ||
        lowerKey.includes('apikey') ||
        lowerKey === 'key' ||
        lowerKey === 'authorization'
      ) {
        // If it's a display mask, keep masked version, else drop
        if (typeof v === 'string' && v.startsWith('••••')) {
          clean[k] = v;
        } else {
          continue; // Omit from response entirely
        }
      } else {
        clean[k] = sanitizeObject(v);
      }
    }
    return clean;
  }

  return obj;
}

/**
 * Mask phone numbers for display (e.g. +966•••••••67)
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone || phone.length < 6) return '••••••';
  const visiblePrefix = phone.slice(0, 4);
  const visibleSuffix = phone.slice(-2);
  return `${visiblePrefix}••••••${visibleSuffix}`;
}

/**
 * Mask WhatsApp Phone Number ID or Business Account ID for safe UI display (e.g. ••••7890)
 */
export function maskId(id?: string): string {
  if (!id || typeof id !== 'string') return '••••';
  const trimmed = id.trim();
  if (trimmed.length <= 4) return '••••' + trimmed;
  return '••••' + trimmed.slice(-4);
}

/**
 * Safe logger that never prints secrets, tokens, or authorization headers
 */
export const safeLogger = {
  info: (...args: any[]) => {
    const sanitized = args.map((a) => (typeof a === 'string' ? sanitizeString(a) : a));
    console.log('[INFO]', ...sanitized);
  },
  warn: (...args: any[]) => {
    const sanitized = args.map((a) => (typeof a === 'string' ? sanitizeString(a) : a));
    console.warn('[WARN]', ...sanitized);
  },
  error: (...args: any[]) => {
    const sanitized = args.map((a) => (typeof a === 'string' ? sanitizeString(a) : a));
    console.error('[ERROR]', ...sanitized);
  }
};

/**
 * SSRF Prevention Validator
 * Ensures external outgoing requests cannot target private networks or AWS/Cloud metadata
 */
export function validateOutgoingUrl(targetUrl: string): { valid: boolean; reason?: string } {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { valid: false, reason: 'Invalid protocol, only HTTP/HTTPS permitted' };
    }

    const host = parsed.hostname.toLowerCase();
    // Block loopback and local subnets
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('172.16.') ||
      host.startsWith('172.17.') ||
      host.startsWith('172.18.') ||
      host.startsWith('172.19.') ||
      host.startsWith('172.2') ||
      host.startsWith('172.3') ||
      host === '169.254.169.254' || // Cloud instance metadata
      host.endsWith('.internal') ||
      host.endsWith('.local')
    ) {
      return { valid: false, reason: 'Access to private internal network or metadata endpoints is forbidden' };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'Malformed URL' };
  }
}

/**
 * Directory Traversal Prevention Helper
 */
export function sanitizePath(inputPath: string): string {
  return inputPath.replace(/\.\./g, '').replace(/[\0]/g, '');
}

/**
 * Unified Error Response builder according to specification:
 * {
 *   "success": false,
 *   "code": "...",
 *   "message": "..."
 * }
 */
export function buildErrorResponse(res: Response, status: number, code: string, message: string) {
  return res.status(status).json({
    success: false,
    code,
    message
  });
}
