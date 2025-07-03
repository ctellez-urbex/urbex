// Global verification codes storage
// This will persist across API requests in development
declare global {
  var __verificationCodes: Map<string, { code: string; expires: number }> | undefined;
}

// Initialize the global store
if (!global.__verificationCodes) {
  global.__verificationCodes = new Map();
}

const verificationCodes = global.__verificationCodes;

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
  
  console.log(`Stored verification code for ${email}: ${code}, expires at ${new Date(expiresAt).toISOString()}`);
}

/**
 * Get and validate a verification code for an email
 */
export function getVerificationCode(email: string): { code: string; expires: number } | null {
  const data = verificationCodes.get(email);
  if (!data) {
    console.log(`No verification code found for ${email}`);
    return null;
  }

  // Check if code has expired
  if (Date.now() > data.expires) {
    console.log(`Verification code for ${email} has expired`);
    verificationCodes.delete(email);
    return null;
  }

  console.log(`Retrieved verification code for ${email}: ${data.code}`);
  return data;
}

/**
 * Get stored verification code for testing (development only)
 */
export function getStoredCodeForTesting(email: string): string | null {
  const data = verificationCodes.get(email);
  const result = data ? data.code : null;
  console.log(`Testing: verification code for ${email}: ${result}`);
  return result;
}

/**
 * Remove a verification code after successful use
 */
export function removeVerificationCode(email: string): void {
  console.log(`Removing verification code for ${email}`);
  verificationCodes.delete(email);
}

/**
 * Clean up expired codes
 */
export function cleanupExpiredCodes(): void {
  const now = Date.now();
  let cleanedCount = 0;
  
  verificationCodes.forEach((data, email) => {
    if (data.expires < now) {
      verificationCodes.delete(email);
      cleanedCount++;
    }
  });
  
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} expired verification codes`);
  }
}

/**
 * Get all stored codes for debugging
 */
export function getAllStoredCodes(): Array<{ email: string; code: string; expires: number; isExpired: boolean }> {
  const now = Date.now();
  return Array.from(verificationCodes.entries()).map(([email, data]) => ({
    email,
    code: data.code,
    expires: data.expires,
    isExpired: now > data.expires
  }));
}

// Clean up expired codes every hour
setInterval(cleanupExpiredCodes, 60 * 60 * 1000); 