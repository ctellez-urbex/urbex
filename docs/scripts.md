# Consolidated Scripts Documentation

## Overview
This project has been cleaned up to consolidate duplicate scripts into more efficient, feature-rich versions.

## Deployment Scripts

### `deploy.js` (Consolidated)
Combines functionality from:
- `deploy-complete.js`
- `deploy-to-s3.js`
- `prepare-deployment.js`

**Usage:**
```bash
# Full deployment (default)
npm run deploy

# Only prepare files
npm run deploy:prepare

# Only deploy to S3 (no CloudFront)
npm run deploy:s3-only

# Direct usage
node scripts/deploy.js --help
```

## User Testing Scripts

### `test-users.js` (Consolidated)
Combines functionality from:
- `test-user-api.js`
- `test-user-attributes.js`
- `test-cognito-errors.js`
- `test-disabled-user.js`

**Usage:**
```bash
# Test API endpoints
npm run test:users:api

# Test user attributes
npm run test:users:attributes <email>

# Test error handling
npm run test:users:errors

# Test disabled user
npm run test:users:disabled <email>

# Direct usage
node scripts/test-users.js --help
```

## Cognito Management Scripts

### `cognito-manager.js` (Consolidated)
Combines functionality from:
- `list-users.js`
- `update-user-attributes.js`
- `setup-cognito-attributes.js`

**Usage:**
```bash
# List users
npm run cognito:list

# Get specific user
npm run cognito:get <email>

# Update all users' attributes
npm run cognito:update-attributes

# Setup custom attributes
npm run cognito:setup-attributes

# Direct usage
node scripts/cognito-manager.js --help
```

## Cognito Configuration Scripts

### `cognito-config.js` (Consolidated)
Combines functionality from:
- `check-cognito-email-config.js`
- `configure-cognito-email-verification.js`

**Usage:**
```bash
# Check current configuration
npm run cognito:check-config

# Configure email verification
npm run cognito:configure

# Direct usage
node scripts/cognito-config.js --help
```

## Benefits of Consolidation

1. **Reduced Maintenance**: Fewer files to maintain and update
2. **Better Organization**: Related functionality grouped together
3. **Improved UX**: Consistent command-line interface across scripts
4. **Enhanced Features**: More options and better error handling
5. **Clearer Documentation**: Single source of truth for each category

## Migration Guide

### Old Commands → New Commands

| Old Command | New Command |
|-------------|-------------|
| `node scripts/deploy-complete.js` | `npm run deploy` |
| `node scripts/deploy-to-s3.js` | `npm run deploy:s3-only` |
| `node scripts/prepare-deployment.js` | `npm run deploy:prepare` |
| `node scripts/test-user-api.js` | `npm run test:users:api` |
| `node scripts/test-user-attributes.js` | `npm run test:users:attributes` |
| `node scripts/list-users.js` | `npm run cognito:list` |
| `node scripts/setup-cognito-attributes.js` | `npm run cognito:setup-attributes` |
| `node scripts/check-cognito-email-config.js` | `npm run cognito:check-config` |

## Environment Variables

All scripts require the following environment variables:
- `AWS_USER_POOL_ID`: Your Cognito User Pool ID
- `AWS_REGION`: AWS region (default: us-east-2)
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `S3_BUCKET_NAME`: S3 bucket name (for deployment)
- `CF_DISTRIBUTION_ID`: CloudFront distribution ID (optional, for deployment)
