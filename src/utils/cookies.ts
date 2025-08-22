/**
 * Cookie utility functions for tracking reveal completion
 */

const REVEAL_COOKIE_NAME = 'brew-off-reveal-seen';
const COOKIE_EXPIRY_DAYS = 365; // Cookie expires in 1 year

/**
 * Set a cookie with the given name, value, and expiration
 */
export function setCookie(name: string, value: string, days: number = COOKIE_EXPIRY_DAYS): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return null;
}

/**
 * Check if the reveal has been seen
 */
export function hasSeenReveal(): boolean {
  return getCookie(REVEAL_COOKIE_NAME) === 'true';
}

/**
 * Mark the reveal as seen
 */
export function markRevealAsSeen(): void {
  setCookie(REVEAL_COOKIE_NAME, 'true');
}

/**
 * Clear the reveal cookie (for testing or reset purposes)
 */
export function clearRevealCookie(): void {
  document.cookie = `${REVEAL_COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
} 