"""
Simple Token Decryption - Minimal Implementation

Quick implementation for decrypting frontend tokens.
Copy these functions to your backend code.
"""

import base64
import urllib.parse
from typing import Optional

# Must match frontend key
ENCRYPTION_KEY = 'URBEX_2024_SECURE_KEY_v1.0'

def decrypt_barmanpre(encrypted_token: str) -> Optional[str]:
    """Decrypt barmanpre token from frontend"""
    try:
        # URL decode if needed
        if '%' in encrypted_token:
            encrypted_token = urllib.parse.unquote(encrypted_token)
        
        # Restore Base64
        base64_str = encrypted_token.replace('-', '+').replace('_', '/')
        while len(base64_str) % 4:
            base64_str += '='
        
        # Decode and reverse operations
        shifted = base64.b64decode(base64_str).decode('latin1')
        xor_result = ''.join(chr(ord(c) - 7) for c in shifted)  # Reverse Caesar shift
        
        # Reverse XOR
        payload = ''
        for i, char in enumerate(xor_result):
            key_char = ENCRYPTION_KEY[i % len(ENCRYPTION_KEY)]
            payload += chr(ord(char) ^ ord(key_char))
        
        # Extract barmanpre
        parts = payload.split('|')
        return parts[0] if len(parts) >= 2 else None
        
    except Exception as e:
        print(f"Decryption error: {e}")
        return None

# Example usage:
if __name__ == "__main__":
    # Test with a token from your frontend
    test_token = "your-encrypted-token-here"
    result = decrypt_barmanpre(test_token)
    print(f"Decrypted: {result}")
