# Running the Urbex Project

This document provides comprehensive instructions on how to run the Urbex project in different environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Running in Development Mode](#running-in-development-mode)
- [Running Production Build Locally](#running-production-build-locally)
- [Testing the Static Export](#testing-the-static-export)
- [Deploying to Production](#deploying-to-production)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before running the project, ensure you have the following installed:

### Required Software
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **AWS CLI**: Latest version (for deployment)
- **Git**: For version control

### AWS Account Requirements
- AWS Account with appropriate permissions
- AWS Cognito User Pool configured
- S3 bucket for hosting (for production deployment)
- CloudFront distribution (optional, for CDN)

### External Services
- **Mailgun Account**: For email functionality (password reset, notifications)
- **API Access**: Valid API key for external API

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/urbex.git
cd urbex
```

### 2. Install Dependencies
```bash
npm install
```

This will install all necessary dependencies including:
- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- AWS SDK v3
- And all other dependencies listed in `package.json`

### 3. Configure Environment Variables

#### For Local Development
Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# AWS Cognito Configuration
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_USER_POOL_ID=your_user_pool_id_here
AWS_POOL_CLIENT_ID=your_client_id_here

# Mailgun Configuration (Required for password reset)
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
CONTACT_EMAIL=your_contact_email

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://eo6cj32bch.execute-api.us-east-2.amazonaws.com/prod/api/v1
NEXT_PUBLIC_API_KEY=your_api_key_here

# Application Configuration
NEXT_PUBLIC_APP_NAME=Urbex
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

#### For Static Export (S3 Deployment)
Generate the public configuration file:

```bash
# For production
npm run env:generate -- --env=production

# For staging
npm run env:generate -- --env=staging

# For development
npm run env:generate -- --env=development
```

This creates `/public/env.js` with your environment configuration.

### 4. Verify Cognito Configuration
```bash
npm run cognito:check-config
```

This script checks if your AWS Cognito is properly configured with required attributes.

## Running in Development Mode

### Standard Development Server
Start the Next.js development server with hot-reload:

```bash
npm run dev
```

The application will be available at:
- **URL**: http://localhost:3000
- **Hot Reload**: Enabled
- **Source Maps**: Enabled
- **Error Overlay**: Enabled

### Development Server Features
- Fast Refresh for instant updates
- TypeScript type checking
- ESLint validation
- Automatic route detection
- API routes available at `/api/*`

### Accessing the Application
Once the server is running, you can access:
- **Homepage**: http://localhost:3000/
- **Login**: http://localhost:3000/auth/login
- **Register**: http://localhost:3000/auth/register
- **Dashboard**: http://localhost:3000/dashboard/ (requires authentication)
- **Admin Panel**: http://localhost:3000/admin/users/ (requires authentication)

## Running Production Build Locally

### Step 1: Build the Project
```bash
npm run build
```

This command:
1. Compiles TypeScript to JavaScript
2. Bundles and optimizes all assets
3. Generates static HTML pages
4. Creates the `out/` directory with all files
5. Applies trailing slash configuration for S3 compatibility

**Expected Output:**
```
Route (app)                              Size     First Load JS
┌ ○ /                                    5.13 kB        92.3 kB
├ ○ /auth/login                          1.83 kB        89.5 kB
├ ○ /dashboard                           3.42 kB        91.1 kB
└ ○ /properties                          2.76 kB        90.4 kB
```

### Step 2: Start the Static Server

#### Option A: Using serve-static.js (Recommended)
This server mimics S3 + CloudFront behavior:

```bash
node serve-static.js
```

**Features:**
- Serves files from `out/` directory
- Handles trailing slash redirects
- Mimics S3 index.html resolution
- Provides detailed logging
- Available at http://localhost:3000

**Console Output:**
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

#### Option B: Using npx serve
A simpler alternative for quick testing:

```bash
npx serve out -p 3000
```

**Note:** This doesn't handle trailing slash redirects like `serve-static.js`.

## Testing the Static Export

### Testing Routing

The project uses **trailing slash** configuration to ensure compatibility with S3 static website hosting.

#### Test URLs
Try accessing these URLs to verify routing:

1. **Root Path**
   ```
   http://localhost:3000/
   ```
   ✅ Should load the homepage

2. **Dashboard (without trailing slash)**
   ```
   http://localhost:3000/dashboard
   ```
   ✅ Should redirect to `/dashboard/` (301)

3. **Dashboard (with trailing slash)**
   ```
   http://localhost:3000/dashboard/
   ```
   ✅ Should load `dashboard/index.html`

4. **Auth Routes**
   ```
   http://localhost:3000/auth/login/
   http://localhost:3000/auth/register/
   http://localhost:3000/auth/forgot-password/
   ```
   ✅ All should load correctly

5. **Admin Routes**
   ```
   http://localhost:3000/admin/users/
   ```
   ✅ Should load (requires authentication)

### Testing Authentication Flow

1. **Register a New User**
   - Go to http://localhost:3000/auth/register
   - Fill in the form with valid data
   - Submit and check email for confirmation code
   - Verify email at http://localhost:3000/auth/verify-email

2. **Login**
   - Go to http://localhost:3000/auth/login
   - Enter credentials
   - Should redirect to dashboard

3. **Password Reset**
   - Go to http://localhost:3000/auth/forgot-password
   - Enter email
   - Check email for reset code
   - Enter code and new password

### Testing API Integration

Test if the external API is working:

```bash
npm run test:users:api
```

This script tests:
- User registration
- Email verification
- Login
- Profile retrieval

## Deploying to Production

### Deployment to S3

#### Step 1: Configure AWS Credentials
```bash
aws configure
```

Enter your AWS credentials when prompted.

#### Step 2: Update Deployment Script
Edit `s3-deploy.sh` and set:
```bash
BUCKET_NAME="urbex.com.co-production"
CLOUDFRONT_DISTRIBUTION_ID="your-cloudfront-id"  # Optional
```

#### Step 3: Deploy
```bash
./s3-deploy.sh production
```

This script will:
1. Build the project (`npm run build`)
2. Sync files to S3 bucket
3. Set appropriate cache headers
4. Configure content types
5. Invalidate CloudFront cache (if configured)

**Expected Output:**
```
🚀 Starting deployment to production environment...
📦 Building the project...
☁️ Syncing static assets to S3 bucket...
📄 Syncing HTML files to S3 bucket...
🔧 Setting content types...
🔄 Invalidating CloudFront cache...
✅ Deployment completed successfully!
🌐 Website URL: https://urbex.com.co
```

### Deployment Options

#### Deploy Only Static Files (No CloudFront)
```bash
npm run deploy:s3-only
```

#### Deploy with CloudFront Invalidation
```bash
npm run deploy
```

#### Prepare Files Without Deploying
```bash
npm run deploy:prepare
```

### Post-Deployment Verification

1. **Check S3 Website Endpoint**
   ```
   http://your-bucket-name.s3-website-region.amazonaws.com
   ```

2. **Check CloudFront Distribution**
   ```
   https://your-cloudfront-domain.cloudfront.net
   ```

3. **Check Custom Domain**
   ```
   https://urbex.com.co
   ```

4. **Verify Routing**
   - Test all major routes
   - Check trailing slash behavior
   - Verify 404 error handling
   - Test client-side navigation

## Troubleshooting

### Common Issues and Solutions

#### Issue: 404 Errors in Production
**Symptoms:** Routes return 404 errors in S3/CloudFront

**Solutions:**
1. Verify `trailingSlash: true` in `next.config.js`
2. Rebuild the project: `npm run build`
3. Redeploy: `./s3-deploy.sh production`
4. Clear CloudFront cache
5. Check S3 website configuration

#### Issue: 404 Errors in Local Testing
**Symptoms:** Routes return 404 when testing locally

**Solutions:**
1. Use `node serve-static.js` instead of other static servers
2. Ensure you've run `npm run build` first
3. Check that `out/` directory contains the built files
4. Verify trailing slashes in URLs

#### Issue: Environment Variables Not Loading
**Symptoms:** API calls fail, Cognito errors

**Solutions:**
1. For development: Check `.env.local` exists and has correct values
2. For production: Run `npm run env:generate -- --env=production`
3. Verify `/public/env.js` exists and is correctly configured
4. Clear browser cache and reload

#### Issue: Cognito Authentication Fails
**Symptoms:** Login/register doesn't work

**Solutions:**
```bash
# Check Cognito configuration
npm run cognito:check-config

# Verify user pool settings
npm run cognito:list

# Setup required attributes
npm run cognito:setup-attributes
```

#### Issue: Email Not Sending
**Symptoms:** Confirmation emails, password reset emails not received

**Solutions:**
1. Check Mailgun configuration in `.env.local`
2. Verify Mailgun domain is verified
3. Check spam folder
4. Test with: `npm run test:users:errors`

#### Issue: Build Fails
**Symptoms:** `npm run build` throws errors

**Solutions:**
1. Clear cache: `rm -rf .next out`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npm run type-check`
4. Check linter errors: `npm run lint`

#### Issue: Slow Build Times
**Solutions:**
1. Enable SWC minification (already configured)
2. Use bundle analyzer: `ANALYZE=true npm run build`
3. Check for large dependencies
4. Optimize images: `npm run optimize-images`

### Getting Help

If you encounter issues not covered here:

1. Check the documentation in `/docs/`
2. Review the specific guides:
   - [S3 Trailing Slash Solution](./s3-trailing-slash-solution.md)
   - [CloudFront Setup](./cloudfront-setup.md)
   - [Email Troubleshooting](./email-troubleshooting.md)
   - [Cognito Setup](./cognito-setup.md)
3. Check the logs for detailed error messages
4. Contact the development team

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
ANALYZE=true npm run build

# Optimize images
npm run optimize-images

# Check performance
npm run lighthouse
```

### Testing Performance
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:users:api
npm run test:users:attributes
```

## Development Best Practices

1. **Always test locally before deploying**
   ```bash
   npm run build
   node serve-static.js
   ```

2. **Use environment-specific configurations**
   ```bash
   npm run env:generate -- --env=development
   npm run env:generate -- --env=staging
   npm run env:generate -- --env=production
   ```

3. **Keep dependencies updated**
   ```bash
   npm outdated
   npm update
   ```

4. **Monitor AWS costs**
   - Check S3 storage usage
   - Monitor CloudFront data transfer
   - Review Cognito active users

5. **Backup important data**
   - Export Cognito user pool regularly
   - Keep S3 versioning enabled
   - Maintain database backups

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

