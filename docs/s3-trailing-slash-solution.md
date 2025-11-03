# S3 Trailing Slash Solution

## Problem Description

When deploying a Next.js static export to AWS S3, there's a common routing issue:

1. Next.js with `trailingSlash: false` generates clean URLs like `/dashboard`, `/properties`, etc.
2. However, the static export creates files like `dashboard/index.html`, `properties/index.html`
3. When accessing `/dashboard` in S3 without a trailing slash, S3 cannot resolve it to `dashboard/index.html`
4. This causes 404 errors both in local testing and in S3 production

## Root Cause

The issue stems from how S3 static website hosting handles directory indexes:

- **With trailing slash** (`/dashboard/`): S3 automatically serves `dashboard/index.html` ✅
- **Without trailing slash** (`/dashboard`): S3 looks for a file named `dashboard` (no extension), which doesn't exist ❌

## Solution

### 1. Enable Trailing Slash in Next.js Config

Set `trailingSlash: true` in `next.config.js`:

```javascript
const nextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true, // Required for S3 static website hosting
  reactStrictMode: true,
  // ... other config
}
```

**Why this works:**
- Next.js will generate all internal links with trailing slashes
- Links like `<Link href="/dashboard">` will render as `<a href="/dashboard/">`
- S3 can automatically resolve these to the correct `index.html` files

### 2. Update Local Development Server

The `serve-static.js` server has been updated to mimic S3 behavior:

```javascript
// Redirect URLs without trailing slash to with trailing slash (except files)
app.use((req, res, next) => {
  if (req.path !== '/' && !req.path.endsWith('/') && !path.extname(req.path)) {
    const dirPath = path.join(OUT_DIR, req.path);
    const indexPath = path.join(dirPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      return res.redirect(301, req.path + '/');
    }
  }
  next();
});
```

**How it works:**
1. Checks if the URL is missing a trailing slash
2. Verifies if an `index.html` exists in that directory
3. Redirects with 301 to the URL with trailing slash
4. Serves the appropriate `index.html` file

### 3. S3 Website Configuration

The S3 bucket must be configured with website hosting enabled:

```json
{
  "IndexDocument": {
    "Suffix": "index.html"
  },
  "ErrorDocument": {
    "Key": "index.html"
  }
}
```

Apply this configuration:

```bash
aws s3api put-bucket-website \
  --bucket urbex.com.co-production \
  --website-configuration file://s3-website-config.json
```

### 4. CloudFront Configuration

CloudFront should handle 404/403 errors properly:

```json
{
  "CustomErrorResponses": {
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      },
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  }
}
```

**Note:** This configuration redirects all 404/403 errors to the root `/index.html`, which allows client-side routing to take over for dynamic routes.

## Testing Locally

### Step 1: Build the project
```bash
npm run build
```

### Step 2: Start the static server
```bash
node serve-static.js
```

### Step 3: Test URLs
Test these URLs in your browser:
- `http://localhost:3000/` ✅
- `http://localhost:3000/dashboard` → redirects to `/dashboard/` ✅
- `http://localhost:3000/dashboard/` ✅
- `http://localhost:3000/auth/login` → redirects to `/auth/login/` ✅
- `http://localhost:3000/properties/` ✅

## Deploying to S3

### Step 1: Deploy static files
```bash
./s3-deploy.sh production
```

### Step 2: Verify S3 website endpoint
Access your S3 website endpoint:
```
http://urbex.com.co-production.s3-website-us-east-2.amazonaws.com/
```

### Step 3: Test through CloudFront
```
https://urbex.com.co/
```

## Expected Behavior

### Local Development (serve-static.js)
- `/dashboard` → 301 redirect to `/dashboard/`
- `/dashboard/` → serves `out/dashboard/index.html`
- Static assets like `/_next/static/*` → served directly

### S3 Production
- `/dashboard/` → serves `dashboard/index.html` automatically
- `/dashboard` → depends on CloudFront rewrite rules or client handling
- Error pages → CloudFront redirects to `/index.html` for client-side routing

## Benefits of This Approach

1. **Consistency:** Same behavior in local and production
2. **SEO Friendly:** Clean URLs with trailing slashes are standard and SEO-friendly
3. **S3 Compatible:** Works natively with S3 static website hosting
4. **No Lambda@Edge:** No need for expensive Lambda functions to rewrite URLs
5. **Fast:** Direct S3 serving without additional processing

## Troubleshooting

### Issue: 404 errors in production
**Solution:** 
1. Verify `trailingSlash: true` in `next.config.js`
2. Rebuild the project: `npm run build`
3. Redeploy: `./s3-deploy.sh production`
4. Clear CloudFront cache

### Issue: Redirect loops
**Solution:**
1. Check CloudFront custom error responses
2. Ensure S3 website configuration is correct
3. Verify no conflicting redirect rules

### Issue: Some routes work, others don't
**Solution:**
1. Check if the `index.html` files exist in the `out/` directory
2. Verify the build completed successfully
3. Check S3 sync completed for all files

## Architecture Diagram

```
User Request
     ↓
CloudFront (CDN)
     ↓
[Check cache]
     ↓
S3 Static Website
     ↓
Request: /dashboard/
     ↓
S3 serves: dashboard/index.html
     ↓
Client-side routing takes over
```

## References

- [Next.js Static Export Documentation](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Custom Error Responses](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GeneratingCustomErrorResponses.html)

