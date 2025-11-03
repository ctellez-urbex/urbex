#!/usr/bin/env node

/**
 * Script para generar el archivo env.js para el frontend estático
 * 
 * Uso:
 * node scripts/generate-env-js.js --env=production
 * node scripts/generate-env-js.js --env=staging
 * node scripts/generate-env-js.js --env=development
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const envArg = args.find(arg => arg.startsWith('--env='));
const env = envArg ? envArg.split('=')[1] : 'production';

// Environment configurations
// NOTE: Secrets (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, API_KEY, etc.) 
// should NEVER be hardcoded here. They must come from .env.local files.
const ENV_CONFIGS = {
  development: {
    // API Keys should come from .env.local - not hardcoded
    API_KEY: "",
    ADMIN_API_KEY: "",
    PUBLIC_API_KEY: "",
    // AWS credentials should NEVER be in frontend code - server-side only
    AWS_ACCESS_KEY_ID: "",
    AWS_POOL_CLIENT_ID: "",
    AWS_REGION: "us-east-2",
    AWS_SECRET_ACCESS_KEY: "",
    AWS_USER_POOL_ID: "us-east-2_Fpda5LMX0",
    CF_DISTRIBUTION_ID: "",
    CONTACT_EMAIL: "carlos.tellez@urbex.com.co",
    MAILGUN_API_KEY: "",
    MAILGUN_DOMAIN: "",
    NEXT_PUBLIC_API_BASE_URL: "https://eo6cj32bch.execute-api.us-east-2.amazonaws.com/prod/api/v1",
    NEXT_PUBLIC_API_KEY: "09mLQ6KO1k6vadXSBQWVR8JvLMH40oPw2HIRTZyW",
    NEXT_PUBLIC_PROPERTIES_API_BASE_URL: "https://2inmopwwug.execute-api.us-east-2.amazonaws.com/prod/api/v1",
    NEXT_PUBLIC_PROPERTIES_API_KEY: "n2AZJrlRXF8o45FjuYiEk4T5g9kdDxTv4OSxtJDC",
    S3_BUCKET_NAME: "",
    NEXT_PUBLIC_AWS_REGION: "us-east-2",
    NEXT_PUBLIC_AWS_USER_POOL_ID: "us-east-2_Fpda5LMX0",
    NEXT_PUBLIC_AWS_POOL_CLIENT_ID: "dev_client_id_here",
    NEXT_PUBLIC_APP_NAME: "Urbex",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    NEXT_PUBLIC_PROPERTIES_API_BASE_URL_LOCAL: "http://127.0.0.1:8000",
    NEXT_PUBLIC_PROPERTIES_DETAIL_BASE_URL: "https://api.urbex.com.co",
    NODE_ENV: 'development'
  },
  staging: {
    NEXT_PUBLIC_API_BASE_URL: 'https://staging-api.urbex.com.co',
    NEXT_PUBLIC_API_KEY: 'staging_api_key_here',
    NEXT_PUBLIC_AWS_REGION: 'us-east-2',
    NEXT_PUBLIC_AWS_USER_POOL_ID: 'us-east-2_Fpda5LMX0',
    NEXT_PUBLIC_AWS_POOL_CLIENT_ID: 'staging_client_id_here',
    NEXT_PUBLIC_APP_NAME: 'Urbex',
    NEXT_PUBLIC_APP_URL: 'https://staging.urbex.com.co',
    NODE_ENV: 'staging'
  },
  production: {
    NEXT_PUBLIC_API_BASE_URL: 'https://eo6cj32bch.execute-api.us-east-2.amazonaws.com/prod/api/v1',
    NEXT_PUBLIC_API_KEY: '', // Load from .env.local
    NEXT_PUBLIC_PROPERTIES_API_BASE_URL: 'https://2inmopwwug.execute-api.us-east-2.amazonaws.com/prod/api/v1',
    NEXT_PUBLIC_PROPERTIES_API_KEY: '', // Load from .env.local
    NEXT_PUBLIC_PROPERTIES_API_BASE_URL_LOCAL: 'http://127.0.0.1:8000',
    NEXT_PUBLIC_AWS_REGION: 'us-east-2',
    NEXT_PUBLIC_AWS_USER_POOL_ID: 'us-east-2_Fpda5LMX0',
    NEXT_PUBLIC_AWS_POOL_CLIENT_ID: '', // Load from .env.local
    NEXT_PUBLIC_APP_NAME: 'Urbex',
    NEXT_PUBLIC_APP_URL: 'https://urbex.com.co',
    NEXT_PUBLIC_PROPERTIES_DETAIL_BASE_URL: "https://api.urbex.com.co",
    NODE_ENV: 'production'
  }
};

/**
 * Load environment variables from file
 * 
 * @param {string} filePath - Path to environment file
 * @returns {Object} Environment variables
 */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const vars = {};

  content.split('\n').forEach(line => {
    line = line.trim();
    
    // Skip comments and empty lines
    if (line.startsWith('#') || !line) {
      return;
    }

    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      vars[key.trim()] = valueParts.join('=').trim();
    }
  });

  return vars;
}

/**
 * Load existing env.js configuration
 * 
 * @returns {Object} Existing environment variables from env.js
 */
function loadExistingEnvJs() {
  const envJsPath = path.join(process.cwd(), 'public', 'env.js');
  
  if (!fs.existsSync(envJsPath)) {
    return {};
  }

  try {
    const content = fs.readFileSync(envJsPath, 'utf8');
    
    // Extract the window.ENV object using regex
    const envMatch = content.match(/window\.ENV\s*=\s*({[\s\S]*?});/);
    if (envMatch) {
      // Parse the JSON object
      const envObject = JSON.parse(envMatch[1]);
      return envObject;
    }
  } catch (error) {
    console.warn('⚠️  Could not parse existing env.js file:', error.message);
  }
  
  return {};
}

/**
 * Generate env.js content
 * 
 * @param {Object} envVars - Environment variables
 * @param {string} env - Environment name
 * @returns {string} Generated JavaScript content
 */
function generateEnvJsContent(envVars, env) {
  const config = ENV_CONFIGS[env];
  if (!config) {
    throw new Error(`Invalid environment: ${env}`);
  }

  // Load existing env.js configuration to preserve credentials
  const existingConfig = loadExistingEnvJs();

  // Smart merge: use existing values if they exist and are not default values, otherwise use config defaults
  const finalConfig = {};
  
  // Start with environment file variables (lowest priority)
  Object.assign(finalConfig, envVars);
  
  // Add default config values only if not present in existing config or if existing values are defaults
  Object.entries(config).forEach(([key, defaultValue]) => {
    const existingValue = existingConfig[key];
    const isDefaultValue = !existingValue || 
                          existingValue.includes('dev_') || 
                          existingValue.includes('your_') || 
                          existingValue.includes('tu_') ||
                          existingValue === 'http://localhost:3001';
    
    if (isDefaultValue) {
      finalConfig[key] = defaultValue;
    } else {
      finalConfig[key] = existingValue;
    }
  });
  
  // Add any existing config values that aren't in the default config
  Object.entries(existingConfig).forEach(([key, value]) => {
    if (!config.hasOwnProperty(key)) {
      finalConfig[key] = value;
    }
  });
  

  // Filter only NEXT_PUBLIC_ variables, NODE_ENV, and other allowed variables
  // SECURITY: Never include server-side secrets (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) 
  // in frontend code. They should only exist server-side.
  const publicVars = {};
  const allowedKeys = [
    'NODE_ENV',
    // Server-side secrets removed - these should NEVER be in frontend
    // "AWS_ACCESS_KEY_ID",  // ❌ REMOVED - server-side only
    // "AWS_SECRET_ACCESS_KEY", // ❌ REMOVED - server-side only
    "AWS_POOL_CLIENT_ID",
    "AWS_REGION",
    "AWS_USER_POOL_ID",
    "CF_DISTRIBUTION_ID",
    "CONTACT_EMAIL",
    "MAILGUN_API_KEY",
    "MAILGUN_DOMAIN",
    "NEXT_PUBLIC_API_BASE_URL",
    "NEXT_PUBLIC_API_KEY",
    "NEXT_PUBLIC_PROPERTIES_API_BASE_URL",
    "NEXT_PUBLIC_PROPERTIES_API_KEY",
    "S3_BUCKET_NAME",
    "NEXT_PUBLIC_AWS_REGION",
    "NEXT_PUBLIC_AWS_USER_POOL_ID",
    "NEXT_PUBLIC_AWS_POOL_CLIENT_ID",
    "NEXT_PUBLIC_APP_NAME",
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_PROPERTIES_API_BASE_URL_LOCAL",
  ];

  Object.entries(finalConfig).forEach(([key, value]) => {
    if (key.startsWith('NEXT_PUBLIC_') || allowedKeys.includes(key)) {
      publicVars[key] = value;
    }
  });

  const content = `// Environment Configuration for Static Frontend
// Generated for ${env} environment on ${new Date().toISOString()}
// This file is loaded by the frontend to access environment variables
// It's generated during build time and served as static content

window.ENV = ${JSON.stringify(publicVars, null, 2)};

// Log environment configuration (only in development)
if (window.ENV.NODE_ENV === 'development') {
  console.log('🔧 Environment loaded:', window.ENV);
}

// Validate required variables
(function() {
  const required = [
    'API_KEY',
    'ADMIN_API_KEY',
    'PUBLIC_API_KEY',
    'NEXT_PUBLIC_API_BASE_URL',
    'NEXT_PUBLIC_API_KEY',
    'NEXT_PUBLIC_PROPERTIES_API_BASE_URL',
    'NEXT_PUBLIC_PROPERTIES_API_KEY',
    'NEXT_PUBLIC_AWS_REGION',
    'NEXT_PUBLIC_AWS_USER_POOL_ID',
    'NEXT_PUBLIC_AWS_POOL_CLIENT_ID',
    'NEXT_PUBLIC_PROPERTIES_API_BASE_URL_LOCAL'
  ];
  
  const missing = required.filter(key => !window.ENV[key] || window.ENV[key].includes('your_') || window.ENV[key].includes('tu_'));
  
  if (missing.length > 0) {
    console.warn('⚠️  Missing or invalid environment variables:', missing);
    console.warn('Please update the /public/env.js file with proper values');
  } else {
    console.log('✅ All environment variables are properly configured');
  }
})();
`;

  return content;
}

/**
 * Main function
 */
function main() {
  try {
    console.log(`🔧 Generating env.js for ${env} environment...`);

    // Load environment variables from files
    const envFiles = [
      '.env.local',
      `.env.${env}`,
      '.env'
    ];

    let envVars = {};
    
    for (const file of envFiles) {
      const filePath = path.join(process.cwd(), file);
      const fileVars = loadEnvFile(filePath);
      envVars = { ...envVars, ...fileVars };
    }

    // Generate env.js content
    const content = generateEnvJsContent(envVars, env);
    const outputPath = path.join(process.cwd(), 'public', 'env.js');
    
    // Ensure public directory exists
    const publicDir = path.dirname(outputPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Write the file
    fs.writeFileSync(outputPath, content, 'utf8');
    
    console.log(`✅ Generated: ${outputPath}`);
    
    // Display configuration summary
    const config = ENV_CONFIGS[env];
    console.log('\n📋 Configuration Summary:');
    console.log('========================');
    console.log(`Environment: ${env}`);
    console.log(`API Base URL: ${config.NEXT_PUBLIC_API_BASE_URL}`);
    console.log(`App URL: ${config.NEXT_PUBLIC_APP_URL}`);
    console.log(`Node ENV: ${config.NODE_ENV}`);
    
    // Check for overrides
    const overrides = Object.keys(envVars).filter(key => key.startsWith('NEXT_PUBLIC_'));
    if (overrides.length > 0) {
      console.log('\n🔄 Overrides from environment files:');
      overrides.forEach(key => {
        const value = envVars[key];
        const displayValue = value.length > 20 ? `${value.substring(0, 20)}...` : value;
        console.log(`   ${key}: ${displayValue}`);
      });
    }
    
    console.log('\n🎉 env.js file generated successfully!');
    console.log('The frontend will now use these environment variables.');
    
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
  generateEnvJsContent,
  loadEnvFile,
  loadExistingEnvJs
}; 