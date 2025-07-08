#!/usr/bin/env node

/**
 * Script para generar API keys seguras
 * 
 * Uso:
 * node scripts/generate-api-keys.js --env=production
 * node scripts/generate-api-keys.js --env=staging
 * node scripts/generate-api-keys.js --env=development
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const envArg = args.find(arg => arg.startsWith('--env='));
const env = envArg ? envArg.split('=')[1] : 'development';

// Configuration
const CONFIG = {
  development: {
    prefix: 'dev',
    length: 32,
    description: 'Development Environment'
  },
  staging: {
    prefix: 'staging',
    length: 48,
    description: 'Staging Environment'
  },
  production: {
    prefix: 'prod',
    length: 64,
    description: 'Production Environment'
  }
};

/**
 * Generate a secure API key
 * 
 * @param {string} prefix - Key prefix
 * @param {number} length - Key length
 * @returns {string} Generated API key
 */
function generateApiKey(prefix, length) {
  const randomBytes = crypto.randomBytes(length);
  const key = randomBytes.toString('base64url');
  return `${prefix}_${key}`;
}

/**
 * Generate all API keys for an environment
 * 
 * @param {string} env - Environment name
 * @returns {Object} Generated API keys
 */
function generateApiKeys(env) {
  const config = CONFIG[env];
  if (!config) {
    throw new Error(`Invalid environment: ${env}`);
  }

  const keys = {
    API_KEY: generateApiKey(config.prefix, config.length),
    ADMIN_API_KEY: generateApiKey(`${config.prefix}_admin`, config.length),
    PUBLIC_API_KEY: generateApiKey(`${config.prefix}_public`, config.length),
    FRONTEND_API_KEY: generateApiKey(`${config.prefix}_frontend`, config.length)
  };

  return keys;
}

/**
 * Create environment file content
 * 
 * @param {Object} keys - Generated API keys
 * @param {string} env - Environment name
 * @returns {string} Environment file content
 */
function createEnvContent(keys, env) {
  const config = CONFIG[env];
  
  return `# ${config.description} Environment Variables
# Generated on: ${new Date().toISOString()}
# ================================================

# API Keys for ${env} environment
# ===============================
API_KEY=${keys.API_KEY}
ADMIN_API_KEY=${keys.ADMIN_API_KEY}
PUBLIC_API_KEY=${keys.PUBLIC_API_KEY}

# Frontend API Key (for client-side requests)
NEXT_PUBLIC_API_KEY=${keys.FRONTEND_API_KEY}

# API Base URL
NEXT_PUBLIC_API_BASE_URL=${env === 'production' ? 'https://api.urbex.com.co' : 
                         env === 'staging' ? 'https://staging-api.urbex.com.co' : 
                         'http://localhost:3001'}

# AWS Configuration
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_USER_POOL_ID=us-east-2_Fpda5LMX0
AWS_POOL_CLIENT_ID=your_cognito_client_id_here

# Frontend AWS Configuration
NEXT_PUBLIC_AWS_REGION=us-east-2
NEXT_PUBLIC_AWS_USER_POOL_ID=us-east-2_Fpda5LMX0
NEXT_PUBLIC_AWS_POOL_CLIENT_ID=your_cognito_client_id_here

# Mailgun Configuration
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=your_mailgun_domain_here
CONTACT_EMAIL=contact@urbex.com.co

# Application Configuration
NEXT_PUBLIC_APP_NAME=Urbex
NEXT_PUBLIC_APP_URL=${env === 'production' ? 'https://urbex.com.co' : 
                    env === 'staging' ? 'https://staging.urbex.com.co' : 
                    'http://localhost:3000'}

# Security Configuration
JWT_SECRET=${crypto.randomBytes(32).toString('base64url')}
SESSION_SECRET=${crypto.randomBytes(32).toString('base64url')}

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=${env === 'production' ? 'error' : 'debug'}
NODE_ENV=${env}
`;
}

/**
 * Save environment file
 * 
 * @param {string} content - File content
 * @param {string} env - Environment name
 */
function saveEnvFile(content, env) {
  const fileName = env === 'development' ? '.env.local' : `.env.${env}`;
  const filePath = path.join(process.cwd(), fileName);
  
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Environment file created: ${fileName}`);
  } catch (error) {
    console.error(`❌ Error creating environment file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Create API keys documentation
 * 
 * @param {Object} keys - Generated API keys
 * @param {string} env - Environment name
 */
function createApiKeysDoc(keys, env) {
  const config = CONFIG[env];
  const docPath = path.join(process.cwd(), 'docs', `api-keys-${env}.md`);
  
  const content = `# API Keys for ${config.description}

Generated on: ${new Date().toISOString()}

## 🔑 Generated API Keys

### Main API Key
\`\`\`bash
API_KEY=${keys.API_KEY}
\`\`\`

**Usage**: General API access, most endpoints

### Admin API Key
\`\`\`bash
ADMIN_API_KEY=${keys.ADMIN_API_KEY}
\`\`\`

**Usage**: Administrative operations, user management

### Public API Key
\`\`\`bash
PUBLIC_API_KEY=${keys.PUBLIC_API_KEY}
\`\`\`

**Usage**: Public endpoints, contact forms

### Frontend API Key
\`\`\`bash
NEXT_PUBLIC_API_KEY=${keys.FRONTEND_API_KEY}
\`\`\`

**Usage**: Client-side requests, must be prefixed with NEXT_PUBLIC_

## 🔒 Security Notes

1. **Keep these keys secure** - Don't commit them to version control
2. **Rotate regularly** - Change keys every 90 days
3. **Use HTTPS** - Always use HTTPS in production
4. **Monitor usage** - Track API key usage for security
5. **Limit scope** - Use the least privileged key for each operation

## 📝 Usage Examples

### Frontend (Next.js)
\`\`\`typescript
// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  API_KEY: process.env.NEXT_PUBLIC_API_KEY
};
\`\`\`

### Backend (Node.js)
\`\`\`javascript
// Middleware for API key validation
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || !VALID_API_KEYS.includes(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};
\`\`\`

### cURL Example
\`\`\`bash
curl -X POST https://api.urbex.com.co/contact \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${keys.FRONTEND_API_KEY}" \\
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "123456789",
    "message": "Test message"
  }'
\`\`\`

## 🚨 Important

- **Backup these keys** in a secure location
- **Don't share** these keys publicly
- **Test thoroughly** before deploying to production
- **Monitor logs** for unauthorized access attempts

## 🔄 Key Rotation

To rotate these keys:

1. Generate new keys: \`node scripts/generate-api-keys.js --env=${env}\`
2. Update environment variables
3. Deploy the changes
4. Monitor for any issues
5. Remove old keys after 24 hours

---
*This file contains sensitive information. Keep it secure and don't commit to version control.*
`;

  try {
    // Ensure docs directory exists
    const docsDir = path.dirname(docPath);
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    fs.writeFileSync(docPath, content, 'utf8');
    console.log(`✅ API keys documentation created: docs/api-keys-${env}.md`);
  } catch (error) {
    console.error(`❌ Error creating documentation: ${error.message}`);
  }
}

/**
 * Main function
 */
function main() {
  try {
    console.log(`🔑 Generating API keys for ${env} environment...`);
    
    // Generate API keys
    const keys = generateApiKeys(env);
    
    // Create environment file
    const envContent = createEnvContent(keys, env);
    saveEnvFile(envContent, env);
    
    // Create documentation
    createApiKeysDoc(keys, env);
    
    // Display summary
    console.log('\n📋 Generated API Keys Summary:');
    console.log('================================');
    Object.entries(keys).forEach(([name, key]) => {
      console.log(`${name}: ${key.substring(0, 20)}...`);
    });
    
    console.log('\n✅ API keys generated successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Review the generated environment file');
    console.log('2. Update your deployment configuration');
    console.log('3. Test the API endpoints');
    console.log('4. Keep the API keys secure');
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  generateApiKey,
  generateApiKeys,
  createEnvContent
}; 