# API Keys for Production Environment

Generated on: 2025-07-08T14:15:44.039Z

## 🔑 Generated API Keys

### Main API Key
```bash
API_KEY=prod_yZn-M3_xQ2PNILlRNEWDnKHYSt_0ht6F8AOSaMfOBlkdoyU563c81JSgWOsc0SHp5fxGE02v9Rj6se8toH1wzw
```

**Usage**: General API access, most endpoints

### Admin API Key
```bash
ADMIN_API_KEY=prod_admin_7sIt-s36BSD9T-aS75fdDrStYX1uLHyGILtJrHswyrF0eYub8AAkE0tXGyWttu9kxi_VuVUZETc6gwajTTBD3A
```

**Usage**: Administrative operations, user management

### Public API Key
```bash
PUBLIC_API_KEY=prod_public_PKSq2_rjPjPsR1oF-VP2ohBjGXWZQPxEB7g2zPbVYVCweWWELWVakpbx44PR8o29lisrGvMeF3ghkQ04zdzu0A
```

**Usage**: Public endpoints, contact forms

### Frontend API Key
```bash
NEXT_PUBLIC_API_KEY=prod_frontend_Q61qCPrJZ2j3NAZkOyVH8uqQAjVf30j7b-dmY4219QDU-VuCMtFbjQHQO4r_CbfW3Ki0sDfOk1sPMoWzYv_Fmw
```

**Usage**: Client-side requests, must be prefixed with NEXT_PUBLIC_

## 🔒 Security Notes

1. **Keep these keys secure** - Don't commit them to version control
2. **Rotate regularly** - Change keys every 90 days
3. **Use HTTPS** - Always use HTTPS in production
4. **Monitor usage** - Track API key usage for security
5. **Limit scope** - Use the least privileged key for each operation

## 📝 Usage Examples

### Frontend (Next.js)
```typescript
// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  API_KEY: process.env.NEXT_PUBLIC_API_KEY
};
```

### Backend (Node.js)
```javascript
// Middleware for API key validation
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || !VALID_API_KEYS.includes(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};
```

### cURL Example
```bash
curl -X POST https://api.urbex.com.co/contact \
  -H "Content-Type: application/json" \
  -H "x-api-key: prod_frontend_Q61qCPrJZ2j3NAZkOyVH8uqQAjVf30j7b-dmY4219QDU-VuCMtFbjQHQO4r_CbfW3Ki0sDfOk1sPMoWzYv_Fmw" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "123456789",
    "message": "Test message"
  }'
```

## 🚨 Important

- **Backup these keys** in a secure location
- **Don't share** these keys publicly
- **Test thoroughly** before deploying to production
- **Monitor logs** for unauthorized access attempts

## 🔄 Key Rotation

To rotate these keys:

1. Generate new keys: `node scripts/generate-api-keys.js --env=production`
2. Update environment variables
3. Deploy the changes
4. Monitor for any issues
5. Remove old keys after 24 hours

---
*This file contains sensitive information. Keep it secure and don't commit to version control.*
