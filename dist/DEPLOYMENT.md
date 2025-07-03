# Deployment Guide for CloudFront + S3

## Files Generated
- `index.html` - Main entry point for CloudFront
- `_next/static/` - Static assets (JS, CSS, images)
- `public/` - Public assets (images, favicon, etc.)
- `server/app/` - Server-side files

## Upload to S3
1. Upload all files from the `dist` folder to your S3 bucket
2. Make sure `index.html` is in the root of the bucket
3. Set the bucket as a static website hosting

## CloudFront Configuration
1. Set the default root object to `index.html`
2. Configure error pages:
   - 404: `/index.html` (for SPA routing)
   - 403: `/index.html`

## Important Notes
- The `index.html` file redirects to the main application
- All API routes are handled by your backend server
- Static pages are pre-rendered for better performance

## Testing
After deployment, visit your CloudFront URL to verify the site loads correctly.
