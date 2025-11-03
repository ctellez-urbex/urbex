# Quick Start - Testing Routing Solution

This guide helps you quickly test the S3 trailing slash routing solution.

## ⚡ Quick Test (2 minutes)

### Step 1: Build the Project
```bash
npm run build
```

**Expected:** Build completes successfully with all routes shown

### Step 2: Verify File Structure
```bash
npm run test:routing-config
```

**Expected:** All index.html files should show ✅

### Step 3: Start Local Server
```bash
npm run serve:static
```

**Expected Output:**
```
🚀 Servidor estático corriendo en http://localhost:3000
📁 Sirviendo archivos desde: /path/to/urbex/out

🧪 Prueba estas URLs:
   http://localhost:3000/
   http://localhost:3000/dashboard/
   http://localhost:3000/auth/login/
   http://localhost:3000/properties/
   http://localhost:3000/admin/users/

✨ Esto simula el comportamiento de S3 + CloudFront
```

### Step 4: Test in Browser

Open your browser and test these URLs:

1. **Root** → http://localhost:3000/
   - ✅ Should load homepage

2. **Dashboard without trailing slash** → http://localhost:3000/dashboard
   - ✅ Should redirect to `/dashboard/` (check URL bar changes)

3. **Dashboard with trailing slash** → http://localhost:3000/dashboard/
   - ✅ Should load dashboard page directly

4. **Auth Login** → http://localhost:3000/auth/login/
   - ✅ Should load login page

5. **Properties** → http://localhost:3000/properties/
   - ✅ Should load properties page

## 🎯 What Changed?

### Before (Problem)
```javascript
// next.config.js
trailingSlash: false  // ❌ Caused 404 in S3
```
- URLs like `/dashboard` didn't work in S3
- Local testing also failed with 404

### After (Solution)
```javascript
// next.config.js
trailingSlash: true  // ✅ S3 compatible
```
- URLs like `/dashboard/` work in both local and S3
- Auto-redirect from `/dashboard` to `/dashboard/`

## 📊 File Structure Verification

After build, you should see:
```
out/
├── index.html                      # Root page
├── dashboard/
│   └── index.html                  # Dashboard page
├── auth/
│   ├── login/
│   │   └── index.html             # Login page
│   ├── register/
│   │   └── index.html             # Register page
│   └── forgot-password/
│       └── index.html             # Password reset
├── properties/
│   └── index.html                  # Properties page
├── admin/
│   └── users/
│       └── index.html             # Admin panel
└── _next/                          # Next.js assets
```

## ✅ Success Indicators

### Local Testing
- ✅ Build completes without errors
- ✅ All index.html files exist
- ✅ Server starts on port 3000
- ✅ URLs redirect to trailing slash
- ✅ Pages load correctly

### Production (S3)
- ✅ Deploy completes successfully
- ✅ S3 serves pages with trailing slash
- ✅ CloudFront caches correctly
- ✅ Custom domain works
- ✅ No 404 errors

## 🚀 Deploy to S3

Once local testing passes:

### Step 1: Configure AWS
```bash
aws configure
```

### Step 2: Update Deploy Script
Edit `s3-deploy.sh`:
```bash
BUCKET_NAME="your-bucket-name"
CLOUDFRONT_DISTRIBUTION_ID="your-cf-id"  # Optional
```

### Step 3: Deploy
```bash
./s3-deploy.sh production
```

### Step 4: Test Production
Visit your production URL and test the same routes.

## ❌ Troubleshooting

### Issue: 404 in Local Testing
**Solution:**
```bash
# Clean and rebuild
rm -rf .next out
npm run build
npm run serve:static
```

### Issue: Redirect Not Working
**Solution:**
- Ensure you're using `node serve-static.js`
- Don't use `npx serve` or other static servers
- Check console logs for redirect messages

### Issue: Build Fails
**Solution:**
```bash
# Check Node version (should be 18+)
node --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Issue: 404 in S3 Production
**Solution:**
```bash
# Verify S3 website configuration
aws s3api get-bucket-website --bucket your-bucket-name

# Should show:
# {
#     "IndexDocument": { "Suffix": "index.html" },
#     "ErrorDocument": { "Key": "index.html" }
# }

# If not configured, apply config:
aws s3api put-bucket-website \
  --bucket your-bucket-name \
  --website-configuration file://s3-website-config.json
```

## 📚 More Information

For detailed documentation, see:
- `docs/s3-trailing-slash-solution.md` - Complete technical solution
- `docs/run.md` - Comprehensive running guide
- `README.md` - Project overview

## 🎉 Success!

If all tests pass, you're ready to deploy to production! The routing will work consistently across:
- ✅ Local development
- ✅ Local static testing
- ✅ S3 static hosting
- ✅ CloudFront CDN
- ✅ Custom domain

---

**Need Help?** Check the troubleshooting section or review the detailed documentation.

