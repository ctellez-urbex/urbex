#!/usr/bin/env node

/**
 * Cleanup Script for Duplicate Scripts
 * 
 * This script removes the old duplicate scripts and updates package.json
 * with the new consolidated scripts.
 * 
 * Usage:
 *   node scripts/cleanup-duplicates.js
 */

const fs = require('fs');
const path = require('path');

// List of scripts to remove (duplicates)
const scriptsToRemove = [
  'deploy-complete.js',
  'deploy-to-s3.js', 
  'prepare-deployment.js',
  'test-user-api.js',
  'test-user-attributes.js',
  'test-cognito-errors.js',
  'test-disabled-user.js',
  'list-users.js',
  'update-user-attributes.js',
  'setup-cognito-attributes.js',
  'check-cognito-email-config.js',
  'configure-cognito-email-verification.js'
];

// New consolidated scripts
const newScripts = [
  'deploy.js',
  'test-users.js', 
  'cognito-manager.js',
  'cognito-config.js'
];

console.log('🧹 Starting cleanup of duplicate scripts...\n');

// Remove old scripts
console.log('🗑️  Removing duplicate scripts:');
let removedCount = 0;

scriptsToRemove.forEach(scriptName => {
  const scriptPath = path.join(__dirname, scriptName);
  if (fs.existsSync(scriptPath)) {
    try {
      fs.unlinkSync(scriptPath);
      console.log(`  ✅ Removed: ${scriptName}`);
      removedCount++;
    } catch (error) {
      console.log(`  ❌ Failed to remove ${scriptName}: ${error.message}`);
    }
  } else {
    console.log(`  ⚠️  Not found: ${scriptName}`);
  }
});

console.log(`\n📊 Removed ${removedCount} duplicate scripts`);

// Verify new scripts exist
console.log('\n✅ Verifying new consolidated scripts:');
let existingCount = 0;

newScripts.forEach(scriptName => {
  const scriptPath = path.join(__dirname, scriptName);
  if (fs.existsSync(scriptPath)) {
    console.log(`  ✅ Found: ${scriptName}`);
    existingCount++;
  } else {
    console.log(`  ❌ Missing: ${scriptName}`);
  }
});

console.log(`\n📊 Found ${existingCount}/${newScripts.length} new scripts`);

// Update package.json scripts
console.log('\n📝 Updating package.json scripts...');

const packageJsonPath = path.join(__dirname, '..', 'package.json');

if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Remove old script references
    const oldScripts = [
      'deploy:complete',
      'deploy:s3',
      'prepare:deployment',
      'test:user-api',
      'test:user-attributes',
      'test:cognito-errors',
      'test:disabled-user',
      'list:users',
      'update:user-attributes',
      'setup:cognito-attributes',
      'check:cognito-email-config',
      'configure:cognito-email-verification'
    ];
    
    oldScripts.forEach(oldScript => {
      if (packageJson.scripts && packageJson.scripts[oldScript]) {
        delete packageJson.scripts[oldScript];
        console.log(`  🗑️  Removed old script: ${oldScript}`);
      }
    });
    
    // Add new script references
    const newScriptEntries = {
      'deploy': 'node scripts/deploy.js',
      'deploy:prepare': 'node scripts/deploy.js --prepare-only',
      'deploy:s3-only': 'node scripts/deploy.js --s3-only',
      'test:users': 'node scripts/test-users.js',
      'test:users:api': 'node scripts/test-users.js api',
      'test:users:attributes': 'node scripts/test-users.js attributes',
      'test:users:errors': 'node scripts/test-users.js errors',
      'test:users:disabled': 'node scripts/test-users.js disabled',
      'cognito:list': 'node scripts/cognito-manager.js list',
      'cognito:get': 'node scripts/cognito-manager.js get',
      'cognito:update-attributes': 'node scripts/cognito-manager.js update-attributes',
      'cognito:setup-attributes': 'node scripts/cognito-manager.js setup-attributes',
      'cognito:check-config': 'node scripts/cognito-config.js check',
      'cognito:configure': 'node scripts/cognito-config.js configure'
    };
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    Object.entries(newScriptEntries).forEach(([scriptName, scriptCommand]) => {
      packageJson.scripts[scriptName] = scriptCommand;
      console.log(`  ✅ Added new script: ${scriptName}`);
    });
    
    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('\n✅ package.json updated successfully');
    
  } catch (error) {
    console.error('❌ Error updating package.json:', error.message);
  }
} else {
  console.log('⚠️  package.json not found');
}

// Create documentation
console.log('\n📚 Creating documentation...');

const documentation = `# Consolidated Scripts Documentation

## Overview
This project has been cleaned up to consolidate duplicate scripts into more efficient, feature-rich versions.

## Deployment Scripts

### \`deploy.js\` (Consolidated)
Combines functionality from:
- \`deploy-complete.js\`
- \`deploy-to-s3.js\`
- \`prepare-deployment.js\`

**Usage:**
\`\`\`bash
# Full deployment (default)
npm run deploy

# Only prepare files
npm run deploy:prepare

# Only deploy to S3 (no CloudFront)
npm run deploy:s3-only

# Direct usage
node scripts/deploy.js --help
\`\`\`

## User Testing Scripts

### \`test-users.js\` (Consolidated)
Combines functionality from:
- \`test-user-api.js\`
- \`test-user-attributes.js\`
- \`test-cognito-errors.js\`
- \`test-disabled-user.js\`

**Usage:**
\`\`\`bash
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
\`\`\`

## Cognito Management Scripts

### \`cognito-manager.js\` (Consolidated)
Combines functionality from:
- \`list-users.js\`
- \`update-user-attributes.js\`
- \`setup-cognito-attributes.js\`

**Usage:**
\`\`\`bash
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
\`\`\`

## Cognito Configuration Scripts

### \`cognito-config.js\` (Consolidated)
Combines functionality from:
- \`check-cognito-email-config.js\`
- \`configure-cognito-email-verification.js\`

**Usage:**
\`\`\`bash
# Check current configuration
npm run cognito:check-config

# Configure email verification
npm run cognito:configure

# Direct usage
node scripts/cognito-config.js --help
\`\`\`

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
| \`node scripts/deploy-complete.js\` | \`npm run deploy\` |
| \`node scripts/deploy-to-s3.js\` | \`npm run deploy:s3-only\` |
| \`node scripts/prepare-deployment.js\` | \`npm run deploy:prepare\` |
| \`node scripts/test-user-api.js\` | \`npm run test:users:api\` |
| \`node scripts/test-user-attributes.js\` | \`npm run test:users:attributes\` |
| \`node scripts/list-users.js\` | \`npm run cognito:list\` |
| \`node scripts/setup-cognito-attributes.js\` | \`npm run cognito:setup-attributes\` |
| \`node scripts/check-cognito-email-config.js\` | \`npm run cognito:check-config\` |

## Environment Variables

All scripts require the following environment variables:
- \`AWS_USER_POOL_ID\`: Your Cognito User Pool ID
- \`AWS_REGION\`: AWS region (default: us-east-2)
- \`AWS_ACCESS_KEY_ID\`: AWS access key
- \`AWS_SECRET_ACCESS_KEY\`: AWS secret key
- \`S3_BUCKET_NAME\`: S3 bucket name (for deployment)
- \`CF_DISTRIBUTION_ID\`: CloudFront distribution ID (optional, for deployment)
`;

const docsPath = path.join(__dirname, '..', 'docs', 'scripts.md');
const docsDir = path.dirname(docsPath);

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

fs.writeFileSync(docsPath, documentation);
console.log('✅ Documentation created: docs/scripts.md');

console.log('\n🎉 Cleanup completed successfully!');
console.log('\n📝 Summary:');
console.log(`- Removed ${removedCount} duplicate scripts`);
console.log(`- Verified ${existingCount} new consolidated scripts`);
console.log('- Updated package.json with new script commands');
console.log('- Created comprehensive documentation');
console.log('\n💡 Next steps:');
console.log('1. Test the new consolidated scripts');
console.log('2. Update any CI/CD pipelines to use new commands');
console.log('3. Share the new documentation with your team');
console.log('4. Remove any references to old scripts in your documentation'); 