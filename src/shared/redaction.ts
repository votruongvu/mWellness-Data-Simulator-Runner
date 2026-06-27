/**
 * MR-A — Redaction helper (SECRET_AND_ENDPOINT_SAFETY_GATE).
 *
 * Masks tokens / Authorization / secrets in any value before it can reach a
 * log or diagnostics surface. Tokens are NEVER logged in clear text. This is
 * defense-in-depth: the session layer also avoids logging raw tokens at all.
 */

const SENSITIVE_KEY_PATTERN =
  /(authorization|auth|access[_-]?token|refresh[_-]?token|token|password|passwd|secret|api[_-]?key|cookie|set-cookie|bearer)/i;

/** Patterns that look like a credential value even without a key hint. */
const BEARER_PATTERN = /Bearer\s+[A-Za-z0-9._\-+/=]+/gi;
const JWT_PATTERN = /\b[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g;

const MASK = '***REDACTED***';

/** Mask credential-looking substrings inside a free-form string. */
function redactString(input: string): string {
  return input
    .replace(BEARER_PATTERN, `Bearer ${MASK}`)
    .replace(JWT_PATTERN, MASK);
}

/**
 * Recursively redact an arbitrary value for safe logging. Returns a NEW value;
 * the input is never mutated. Cycles are guarded.
 */
export function redact<T>(value: T, seen: WeakSet<object> = new WeakSet()): unknown {
  if (typeof value === 'string') {
    return redactString(value);
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (seen.has(value as object)) {
    return '[Circular]';
  }
  seen.add(value as object);

  if (Array.isArray(value)) {
    return value.map(item => redact(item, seen));
  }

  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      out[key] = MASK;
    } else {
      out[key] = redact(val, seen);
    }
  }
  return out;
}

/** Produce a redacted, JSON-safe string for logging. */
export function redactToString(value: unknown): string {
  try {
    return JSON.stringify(redact(value));
  } catch {
    return MASK;
  }
}

/** Convenience masked-token form for short references in logs. */
export function maskToken(token: string | null | undefined): string {
  if (!token) {
    return '(none)';
  }
  return MASK;
}
