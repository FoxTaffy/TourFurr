/**
 * Security utilities for TourFurr 2026
 * Provides protection against DDoS, brute force, and various attacks
 */

// Rate Limiter for client-side protection
interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs: number
}

interface RateLimitEntry {
  attempts: number
  firstAttempt: number
  blockedUntil?: number
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Cleanup old entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  /**
   * Check if action is allowed for given identifier
   */
  isAllowed(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now()
    const entry = this.storage.get(identifier)

    // Check if currently blocked
    if (entry?.blockedUntil && entry.blockedUntil > now) {
      return false
    }

    // No previous attempts or window expired
    if (!entry || now - entry.firstAttempt > config.windowMs) {
      this.storage.set(identifier, {
        attempts: 1,
        firstAttempt: now
      })
      return true
    }

    // Increment attempts
    entry.attempts++

    // Check if exceeded max attempts
    if (entry.attempts > config.maxAttempts) {
      entry.blockedUntil = now + config.blockDurationMs
      this.storage.set(identifier, entry)
      return false
    }

    this.storage.set(identifier, entry)
    return true
  }

  /**
   * Get remaining time until unblock (in seconds)
   */
  getBlockedTime(identifier: string): number {
    const entry = this.storage.get(identifier)
    if (!entry?.blockedUntil) return 0

    const remaining = Math.ceil((entry.blockedUntil - Date.now()) / 1000)
    return remaining > 0 ? remaining : 0
  }

  /**
   * Reset attempts for identifier
   */
  reset(identifier: string): void {
    this.storage.delete(identifier)
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.storage.entries()) {
      // Remove if block expired and old attempt
      if (
        (!entry.blockedUntil || entry.blockedUntil < now) &&
        now - entry.firstAttempt > 3600000 // 1 hour
      ) {
        this.storage.delete(key)
      }
    }
  }

  /**
   * Destroy rate limiter and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.storage.clear()
  }
}

// Rate limit configurations
export const RATE_LIMITS = {
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes
  },
  REGISTER: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 2 * 60 * 60 * 1000 // 2 hours
  },
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000 // 1 hour
  },
  EMAIL_CHECK: {
    maxAttempts: 20,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000 // 5 minutes
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter()

/**
 * Input sanitization to prevent XSS and injection attacks
 * @param input - String to sanitize
 * @param maxLength - Maximum allowed length (default: 1000)
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input) return ''

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, maxLength) // Limit length
}

/**
 * Validate email format with strict rules
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!emailRegex.test(email)) return false
  if (email.length > 254) return false

  const parts = email.split('@')
  if (parts[0].length > 64) return false

  return true
}

/**
 * Password strength checker
 */
export interface PasswordStrength {
  score: number // 0-4
  feedback: string[]
  isStrong: boolean
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  // Check all basic requirements
  const hasMinLength = password.length >= 8
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password)
  const hasDigits = /\d/.test(password)
  const hasSpecialChars = /[^a-zA-Z0-9]/.test(password)

  // Add feedback for missing requirements
  if (!hasMinLength) feedback.push('Пароль должен содержать минимум 8 символов')
  if (!hasMixedCase) feedback.push('Используйте строчные и заглавные буквы')
  if (!hasDigits) feedback.push('Добавьте цифры')
  if (!hasSpecialChars) feedback.push('Добавьте специальные символы (!@#$%^&*)')

  // Calculate score
  if (hasMinLength) score++
  if (password.length >= 12) score++
  if (hasMixedCase) score++
  if (hasDigits) score++
  if (hasSpecialChars) score++

  // Check for common patterns
  const commonPatterns = [
    /^123456/,
    /password/i,
    /qwerty/i,
    /111111/,
    /abc123/i
  ]

  let hasCommonPattern = false
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score = Math.max(0, score - 2)
      feedback.push('Избегайте очевидных паролей')
      hasCommonPattern = true
      break
    }
  }

  // Normalize score to 0-5
  score = Math.min(5, Math.max(0, score))

  // Password is strong only if it meets ALL basic requirements AND no common patterns
  const isStrong = hasMinLength && hasMixedCase && hasDigits && hasSpecialChars && !hasCommonPattern

  return {
    score,
    feedback,
    isStrong
  }
}

/**
 * Detect suspicious patterns in user input
 */
export function detectSuspiciousActivity(input: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\(/i,
    /expression\(/i,
    /import\s/i,
    /<iframe/i,
    /document\./i,
    /window\./i,
    /SELECT.*FROM/i,
    /INSERT.*INTO/i,
    /DELETE.*FROM/i,
    /DROP.*TABLE/i,
    /UNION.*SELECT/i,
    /--/,
    /;.*--/,
    /\/\*/
  ]

  return suspiciousPatterns.some(pattern => pattern.test(input))
}

/**
 * Generate secure random string for CSRF tokens
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * CSRF Token Manager
 */
class CSRFTokenManager {
  private tokens: Map<string, number> = new Map()
  private readonly TOKEN_LIFETIME = 3600000 // 1 hour

  generate(): string {
    const token = generateSecureToken(32)
    this.tokens.set(token, Date.now())
    this.cleanup()
    return token
  }

  validate(token: string): boolean {
    const timestamp = this.tokens.get(token)
    if (!timestamp) return false

    const isValid = Date.now() - timestamp < this.TOKEN_LIFETIME
    if (isValid) {
      this.tokens.delete(token) // Single use
    }
    return isValid
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [token, timestamp] of this.tokens.entries()) {
      if (now - timestamp > this.TOKEN_LIFETIME) {
        this.tokens.delete(token)
      }
    }
  }
}

export const csrfManager = new CSRFTokenManager()

/**
 * Security event logger
 */
export interface SecurityEvent {
  type: 'login_attempt' | 'login_failure' | 'registration' | 'rate_limit' | 'suspicious_activity' | 'account_locked'
  identifier: string
  timestamp: number
  details?: any
}

class SecurityLogger {
  private events: SecurityEvent[] = []
  private readonly MAX_EVENTS = 1000

  log(event: Omit<SecurityEvent, 'timestamp'>): void {
    this.events.push({
      ...event,
      timestamp: Date.now()
    })

    // Keep only recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS)
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn('[Security Event]', event.type, event.identifier, event.details)
    }
  }

  getEvents(identifier?: string, type?: SecurityEvent['type']): SecurityEvent[] {
    let filtered = this.events

    if (identifier) {
      filtered = filtered.filter(e => e.identifier === identifier)
    }

    if (type) {
      filtered = filtered.filter(e => e.type === type)
    }

    return filtered.slice().reverse() // Most recent first
  }

  getRecentFailures(identifier: string, windowMs: number = 3600000): number {
    const cutoff = Date.now() - windowMs
    return this.events.filter(
      e => e.identifier === identifier &&
           e.type === 'login_failure' &&
           e.timestamp > cutoff
    ).length
  }

  clear(): void {
    this.events = []
  }
}

export const securityLogger = new SecurityLogger()

/**
 * Get client fingerprint for tracking
 */
export function getClientFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage
  ]

  const fingerprint = components.join('|')

  // Simple hash function
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  return Math.abs(hash).toString(36)
}
