/**
 * urlSafety.ts — Guards against javascript: URLs and open redirects
 * from untrusted API data being placed in href attributes.
 */

const ALLOWED_PROTOCOLS = ['https:', 'http:']

/**
 * Returns the URL if it uses an allowed protocol, otherwise '#'.
 * Prevents javascript: or data: URL injection from API responses.
 */
export function safeHref(url: string | undefined | null): string {
  if (!url) return '#'
  try {
    const parsed = new URL(url)
    return ALLOWED_PROTOCOLS.includes(parsed.protocol) ? url : '#'
  } catch {
    return '#'
  }
}

/** Allowed characters in a skill tag. Rejects HTML/script injection attempts. */
const SKILL_PATTERN = /^[a-zA-Z0-9\-_.+/#\s]{1,50}$/

export function sanitiseSkill(raw: string): string {
  const trimmed = raw.trim().toLowerCase()
  return SKILL_PATTERN.test(trimmed) ? trimmed : ''
}
