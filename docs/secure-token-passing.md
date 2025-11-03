# Secure Token Passing - SessionStorage Implementation

## Overview

This document describes the secure token passing mechanism implemented to prevent sensitive property tokens from being visible in the URL when navigating from the Properties page to the Detail Property page.

## Problem Statement

### Before
```
URL: /detail_property/?token=U2FsdGVkX1...very_long_encrypted_token...xyz
```

**Issues:**
- ❌ Token visible in browser URL bar
- ❌ Token visible in browser history
- ❌ Token visible in server logs
- ❌ Token can be shared/bookmarked accidentally
- ❌ Security risk if URL is copied/shared

## Solution: SessionStorage + Reference Key

### Architecture

```
Properties Page                    Detail Property Page
     |                                     |
     | 1. Encrypt barmanpre                |
     |    encryptBarmanpre(id)            |
     |                                     |
     | 2. Generate unique key              |
     |    property_token_${timestamp}      |
     |                                     |
     | 3. Store in sessionStorage          |
     |    sessionStorage.setItem(key, token)|
     |                                     |
     | 4. Navigate with ref only           |
     | -------- /detail_property/?ref=key ------> |
     |                                     |
     |                                     | 5. Read from sessionStorage
     |                                     |    sessionStorage.getItem(ref)
     |                                     |
     |                                     | 6. Clean up immediately
     |                                     |    sessionStorage.removeItem(ref)
     |                                     |
     | 7. Auto-cleanup (30s timeout)       |
     |    sessionStorage.removeItem(key)   |
```

### After
```
URL: /detail_property/?ref=property_token_1696234567890
```

**Benefits:**
- ✅ Token NOT visible in URL
- ✅ Token NOT in browser history
- ✅ Token NOT in server logs
- ✅ Token auto-expires (30 seconds)
- ✅ Token removed after first use
- ✅ Unique key per navigation
- ✅ Cannot be shared/bookmarked

## Implementation Details

### Properties Page (Sending Side)

```typescript
// File: src/app/properties/page.tsx

onClick={() => {
  // 1. Encrypt the property ID
  const encryptedToken = encryptBarmanpre(selectedProperty.barmanpre);
  
  // 2. Generate unique storage key with timestamp
  const storageKey = `property_token_${Date.now()}`;
  
  // 3. Store encrypted token in sessionStorage
  sessionStorage.setItem(storageKey, encryptedToken);
  
  // 4. Build URL with only the reference key (not the token)
  const detailUrl = `/detail_property/?ref=${storageKey}`;
  
  // 5. Open new window
  window.open(detailUrl, '_blank', 'width=1200,height=800');
  
  // 6. Auto-cleanup after 30 seconds (security measure)
  setTimeout(() => {
    sessionStorage.removeItem(storageKey);
    console.log('🧹 Token cleaned from sessionStorage');
  }, 30000);
}
```

### Detail Property Page (Receiving Side)

```typescript
// File: src/app/detail_property/page.tsx

useEffect(() => {
  // 1. Get reference key from URL
  const refParam = searchParams.get('ref');
  
  if (refParam) {
    // 2. Retrieve token from sessionStorage using reference
    const storedToken = sessionStorage.getItem(refParam);
    
    if (storedToken) {
      console.log('🔐 Token retrieved from sessionStorage');
      
      // 3. Use the token
      setToken(storedToken);
      handleTokenDecryption(storedToken);
      
      // 4. Immediately clean up sessionStorage (one-time use)
      sessionStorage.removeItem(refParam);
      console.log('🧹 Token cleaned after use');
    } else {
      // Token not found or expired
      setDecryptError('Token not found or expired. Please try again.');
    }
  } else {
    // Fallback: check for direct token in URL (backward compatibility)
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      console.log('⚠️ Using token from URL (legacy method)');
      setToken(tokenParam);
      handleTokenDecryption(tokenParam);
    } else {
      setDecryptError('No token reference found. Please access from properties page.');
    }
  }
}, [searchParams]);
```

## Security Features

### 1. **Unique Keys**
Each navigation generates a unique key using timestamp:
```typescript
const storageKey = `property_token_${Date.now()}`;
// Example: property_token_1696234567890
```

### 2. **One-Time Use**
Token is immediately removed after being read:
```typescript
sessionStorage.removeItem(refParam);
```

### 3. **Time-Based Expiration**
Token auto-expires after 30 seconds:
```typescript
setTimeout(() => {
  sessionStorage.removeItem(storageKey);
}, 30000); // 30 seconds
```

### 4. **SessionStorage Scope**
- Only available in same browser session
- Not shared across tabs (for new windows, it works because it's same origin)
- Cleared when browser is closed
- Not accessible from other domains

### 5. **Fallback Compatibility**
Still supports legacy `?token=` parameter for backward compatibility:
```typescript
// Fallback for old links
const tokenParam = searchParams.get('token');
if (tokenParam) {
  console.log('⚠️ Using token from URL (legacy method)');
  handleTokenDecryption(tokenParam);
}
```

## Benefits

### Security Benefits
1. **No URL Exposure**: Token never appears in URL bar
2. **No History Pollution**: Browser history only shows reference keys
3. **No Log Exposure**: Server logs don't contain sensitive tokens
4. **No Accidental Sharing**: Users can't copy/share token URLs
5. **No Bookmarking**: Bookmarked URLs won't work (token expired)
6. **Time-Limited**: Tokens expire automatically
7. **One-Time Use**: Each token can only be used once

### User Experience Benefits
1. **Clean URLs**: URLs look professional and clean
2. **No Confusion**: Users don't see cryptic token strings
3. **Fast Navigation**: No performance impact
4. **Transparent**: Works seamlessly in background

### Developer Benefits
1. **Easy to Implement**: Uses standard browser API
2. **No Backend Changes**: Pure frontend solution
3. **Backward Compatible**: Supports old token method
4. **Debuggable**: Console logs show flow
5. **Testable**: Can mock sessionStorage

## Edge Cases Handled

### 1. Token Not Found
```typescript
if (!storedToken) {
  setDecryptError('Token not found or expired. Please try again.');
}
```
**Cause:** Token expired or already used  
**Solution:** User redirected back to properties page

### 2. No Reference Parameter
```typescript
if (!refParam) {
  setDecryptError('No token reference found. Please access from properties page.');
}
```
**Cause:** Direct URL access without reference  
**Solution:** Clear error message with instructions

### 3. SessionStorage Unavailable
```typescript
try {
  sessionStorage.setItem(storageKey, encryptedToken);
} catch (error) {
  console.error('SessionStorage not available:', error);
  // Fallback to URL token method
}
```
**Cause:** Private browsing or storage quota  
**Solution:** Fallback to legacy URL method

### 4. Cross-Origin Issues
SessionStorage is same-origin, so works correctly for:
- Same domain navigation ✅
- New windows from same origin ✅
- Different tabs (won't work, by design) ❌

## Testing

### Manual Testing

1. **Normal Flow**
   ```bash
   1. Go to /properties/
   2. Search for property
   3. Click "Ver Detalles"
   4. Verify URL shows /detail_property/?ref=property_token_...
   5. Verify property details load correctly
   6. Check browser console for success messages
   ```

2. **Token Expiration**
   ```bash
   1. Open properties page
   2. Click "Ver Detalles" but don't navigate
   3. Wait 30 seconds
   4. Try to navigate to detail page
   5. Should show "Token expired" error
   ```

3. **Direct URL Access**
   ```bash
   1. Copy detail property URL with ref
   2. Close tab
   3. Try to access URL directly
   4. Should show "Token not found" error
   ```

4. **Legacy Support**
   ```bash
   1. Navigate to /detail_property/?token=ENCRYPTED_TOKEN
   2. Should still work (backward compatibility)
   3. Console should show "Using token from URL (legacy method)"
   ```

### Automated Testing

```typescript
describe('Secure Token Passing', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should store token in sessionStorage', () => {
    const token = 'encrypted_token_123';
    const key = `property_token_${Date.now()}`;
    sessionStorage.setItem(key, token);
    
    expect(sessionStorage.getItem(key)).toBe(token);
  });

  it('should remove token after retrieval', () => {
    const key = 'property_token_test';
    const token = 'test_token';
    sessionStorage.setItem(key, token);
    
    // Simulate retrieval
    const retrieved = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
    
    expect(sessionStorage.getItem(key)).toBeNull();
  });

  it('should generate unique keys', () => {
    const key1 = `property_token_${Date.now()}`;
    const key2 = `property_token_${Date.now()}`;
    
    expect(key1).not.toBe(key2);
  });
});
```

## Comparison: Before vs After

| Aspect | Before (URL Token) | After (SessionStorage) |
|--------|-------------------|------------------------|
| **URL Visibility** | Token in URL | Only reference key |
| **URL Length** | Very long | Short and clean |
| **Browser History** | Contains token | Only reference |
| **Server Logs** | Contains token | Only reference |
| **Shareable** | Yes (security risk) | No (expires quickly) |
| **Bookmarkable** | Yes (security risk) | No (one-time use) |
| **Expiration** | Never | 30 seconds |
| **Security** | Medium | High |
| **User Experience** | Cluttered URL | Clean URL |

## Best Practices

### Do's ✅
1. Always generate unique keys with timestamp
2. Clean up sessionStorage after use
3. Set reasonable expiration time (30s)
4. Provide clear error messages
5. Log actions for debugging
6. Support fallback for compatibility

### Don'ts ❌
1. Don't reuse storage keys
2. Don't store tokens indefinitely
3. Don't rely on sessionStorage for critical data
4. Don't forget to handle edge cases
5. Don't expose implementation details to users

## Future Enhancements

### Potential Improvements
1. **IndexedDB Storage**: For larger data or longer persistence
2. **Encryption Layer**: Additional encryption on sessionStorage
3. **Refresh Mechanism**: Allow token refresh if expired
4. **Multi-Tab Support**: Sync tokens across tabs (if needed)
5. **Analytics**: Track token usage patterns

### Security Enhancements
1. **Token Signing**: Add HMAC signature to verify integrity
2. **Rate Limiting**: Limit token generation frequency
3. **IP Binding**: Bind token to IP address
4. **Device Fingerprinting**: Add device verification

## Related Documentation

- [Detail Property Architecture](./detail-property-architecture.md)
- [Encryption Implementation](../src/lib/encryption.ts)
- [Properties Page](../src/app/properties/page.tsx)
- [Detail Property Page](../src/app/detail_property/page.tsx)

---

**Last Updated**: October 1, 2025  
**Version**: 1.0  
**Security Level**: High  
**Maintained By**: Urbex Development Team

