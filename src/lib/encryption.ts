/**
 * Frontend Encryption Utilities
 * 
 * Simple encryption/decryption for sensitive data like barmanpre
 * Uses Base64 encoding with simple character shifting for obfuscation
 */

// Secret key for encryption (you can change this)
const ENCRYPTION_KEY = 'URBEX_2024_SECURE_KEY_v1.0';

/**
 * Simple character shifting cipher
 * @param text - Text to shift
 * @param shift - Number of positions to shift
 * @returns Shifted text
 */
function caesarShift(text: string, shift: number): string {
  return text
    .split('')
    .map(char => {
      const code = char.charCodeAt(0);
      // Apply shift to all characters
      return String.fromCharCode(code + shift);
    })
    .join('');
}

/**
 * XOR cipher with key
 * @param text - Text to encrypt/decrypt
 * @param key - Encryption key
 * @returns XOR result
 */
function xorCipher(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const textChar = text.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    result += String.fromCharCode(textChar ^ keyChar);
  }
  return result;
}

/**
 * Encrypt a barmanpre for URL usage
 * @param barmanpre - The barmanpre to encrypt
 * @returns Encrypted and URL-safe string
 */
export function encryptBarmanpre(barmanpre: string): string {
  try {
    console.log('🔐 Encrypting barmanpre:', barmanpre);
    
    // Step 1: Add timestamp for uniqueness
    const timestamp = Date.now().toString(36); // Base36 timestamp
    const payload = `${barmanpre}|${timestamp}`;
    
    // Step 2: XOR with key
    const xorResult = xorCipher(payload, ENCRYPTION_KEY);
    
    // Step 3: Caesar shift
    const shifted = caesarShift(xorResult, 7);
    
    // Step 4: Base64 encode
    const base64 = btoa(shifted);
    
    // Step 5: Make URL safe
    const urlSafe = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    console.log('✅ Barmanpre encrypted successfully');
    return urlSafe;
  } catch (error) {
    console.error('❌ Encryption error:', error);
    // Fallback: return a simple base64 of the original
    return btoa(barmanpre).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
}

/**
 * Decrypt a barmanpre from URL
 * @param encrypted - The encrypted string from URL
 * @returns Original barmanpre or null if decryption fails
 */
export function decryptBarmanpre(encrypted: string): string | null {
  try {
    console.log('🔓 Decrypting barmanpre:', encrypted.substring(0, 20) + '...');
    
    // Step 1: Restore URL-safe Base64
    let base64 = encrypted
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // Step 2: Base64 decode
    const shifted = atob(base64);
    
    // Step 3: Reverse Caesar shift
    const xorResult = caesarShift(shifted, -7);
    
    // Step 4: Reverse XOR
    const payload = xorCipher(xorResult, ENCRYPTION_KEY);
    
    // Step 5: Extract barmanpre (ignore timestamp)
    const parts = payload.split('|');
    if (parts.length >= 2) {
      const barmanpre = parts[0];
      console.log('✅ Barmanpre decrypted successfully');
      return barmanpre;
    } else {
      throw new Error('Invalid payload format');
    }
  } catch (error) {
    console.error('❌ Decryption error:', error);
    
    // Fallback: try simple base64 decode
    try {
      let base64 = encrypted
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      while (base64.length % 4) {
        base64 += '=';
      }
      
      const fallback = atob(base64);
      console.log('⚠️ Using fallback decryption');
      return fallback;
    } catch (fallbackError) {
      console.error('❌ Fallback decryption also failed:', fallbackError);
      return null;
    }
  }
}

/**
 * Validate if an encrypted string looks valid
 * @param encrypted - The encrypted string to validate
 * @returns True if it looks like a valid encrypted string
 */
export function isValidEncryptedBarmanpre(encrypted: string): boolean {
  // Basic validation: should be a reasonable length and contain only URL-safe Base64 chars
  const urlSafeBase64Regex = /^[A-Za-z0-9\-_]+$/;
  return encrypted.length > 10 && encrypted.length < 200 && urlSafeBase64Regex.test(encrypted);
}

/**
 * Generate a test encryption/decryption
 * @param testBarmanpre - Test barmanpre to use
 */
export function testEncryption(testBarmanpre: string = 'TEST123'): boolean {
  console.log('🧪 Testing encryption/decryption...');
  console.log('Original:', testBarmanpre);
  
  const encrypted = encryptBarmanpre(testBarmanpre);
  console.log('Encrypted:', encrypted);
  
  const decrypted = decryptBarmanpre(encrypted);
  console.log('Decrypted:', decrypted);
  
  const success = decrypted === testBarmanpre;
  console.log('Test result:', success ? '✅ PASS' : '❌ FAIL');
  
  return success;
}
