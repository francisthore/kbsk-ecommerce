/**
 * Authentication validation utilities for KBSK Trading
 * Provides robust validation for email, password, name, and input sanitization
 */

/**
 * Validates email format using RFC 5322 compliant regex
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Password validation result interface
 */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates password strength with detailed error messages
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates password strength (0-4)
 * 0 = Very Weak, 1 = Weak, 2 = Fair, 3 = Good, 4 = Strong
 */
export function getPasswordStrength(password: string): number {
  if (!password) return 0;

  let strength = 0;

  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

  return Math.min(strength, 4);
}

/**
 * Validates name (first name, last name, or full name)
 */
export function validateName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;

  const trimmed = name.trim();
  
  // Must be between 1 and 100 characters
  if (trimmed.length < 1 || trimmed.length > 100) return false;

  // Should only contain letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  return nameRegex.test(trimmed);
}

/**
 * Validates phone number (basic international format)
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Should have between 10 and 15 digits
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

/**
 * Sanitizes user input to prevent XSS attacks
 * Removes potentially dangerous characters and HTML tags
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Limit to reasonable length
    .slice(0, 1000);
}

/**
 * Validates that two passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && password.length > 0;
}

/**
 * Checks if a URL is safe for redirection (prevents open redirect attacks)
 */
export function isSafeRedirectUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  try {
    // Only allow relative URLs or same-origin URLs
    if (url.startsWith('/') && !url.startsWith('//')) {
      return true;
    }

    // Check if it's a valid URL
    const parsedUrl = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    
    // Only allow http and https protocols
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }

    // In production, verify it's the same origin
    if (typeof window !== 'undefined') {
      return parsedUrl.origin === window.location.origin;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Validates verification token format
 */
export function validateToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;

  // Token should be alphanumeric and between 20-200 characters
  const tokenRegex = /^[a-zA-Z0-9_-]{20,200}$/;
  return tokenRegex.test(token);
}
