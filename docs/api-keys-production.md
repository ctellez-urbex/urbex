# API Keys for Production Environment

Generated on: 2025-07-08T21:52:18.115Z

## 🔑 Generated API Keys

### Main API Key
```bash
API_KEY=prod_DTMuGR8JOSwKBdujtm3SRCM_fySYUpr8K-vNBCD7ZHoxxOd0xoT4cRhWeBdrcuHziXwQkbBTQnY0PgniyAkh-g
```

**Usage**: General API access, most endpoints

### Admin API Key
```bash
ADMIN_API_KEY=prod_admin_Y5Qn0jjnqZsYx5Kay7dKYGOEO6uWEH7awfTuE_x69bCrk4yI1GAhC1I3V4oqIh8H4q3QtUkx9T8opJnyqUqSYg
```

**Usage**: Administrative operations, user management

### Public API Key
```bash
PUBLIC_API_KEY=prod_public_FGPY_YOzWZqWEdTfd8uZCZP1jbGJ2WLb3L5nk4QGxNvdpMzIy0go5kSA4ru-P1nF1r-Sv13n3P8aJ0uBj1y3tw
```

**Usage**: Public endpoints, contact forms

### Frontend API Key
```bash
NEXT_PUBLIC_API_KEY=09mLQ6KO1k6vadXSBQWVR8JvLMH40oPw2HIRTZyW
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
curl -X POST https://eo6cj32bch.execute-api.us-east-2.amazonaws.com/prod/api/v1/contact/ \
  -H "Content-Type: application/json" \
  -H "x-api-key: 09mLQ6KO1k6vadXSBQWVR8JvLMH40oPw2HIRTZyW" \
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
