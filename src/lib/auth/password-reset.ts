// Shared verification codes storage (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expires: number }>();

/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store a verification code for an email
 */
export function storeVerificationCode(email: string, code: string, expiresInMinutes: number = 15): void {
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  verificationCodes.set(email, {
    code,
    expires: expiresAt,
  });
}

/**
 * Get and validate a verification code for an email
 */
export function getVerificationCode(email: string): { code: string; expires: number } | null {
  const data = verificationCodes.get(email);
  if (!data) {
    return null;
  }

  // Check if code has expired
  if (Date.now() > data.expires) {
    verificationCodes.delete(email);
    return null;
  }

  return data;
}

/**
 * Get stored verification code for testing (development only)
 */
export function getStoredCodeForTesting(email: string): string | null {
  const data = verificationCodes.get(email);
  return data ? data.code : null;
}

/**
 * Remove a verification code after successful use
 */
export function removeVerificationCode(email: string): void {
  verificationCodes.delete(email);
}

/**
 * Clean up expired codes
 */
export function cleanupExpiredCodes(): void {
  const now = Date.now();
  verificationCodes.forEach((data, email) => {
    if (data.expires < now) {
      verificationCodes.delete(email);
    }
  });
}

// Clean up expired codes every hour
setInterval(cleanupExpiredCodes, 60 * 60 * 1000); 