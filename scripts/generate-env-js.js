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
const ENV_CONFIGS = {
  development: {
    NEXT_PUBLIC_API_BASE_URL: 'http://localhost:3001',
    NEXT_PUBLIC_API_KEY: 'dev_api_key_here',
    NEXT_PUBLIC_AWS_REGION: 'us-east-2',
    NEXT_PUBLIC_AWS_USER_POOL_ID: 'us-east-2_Fpda5LMX0',
    NEXT_PUBLIC_AWS_POOL_CLIENT_ID: 'dev_client_id_here',
    NEXT_PUBLIC_APP_NAME: 'Urbex',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
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
    NEXT_PUBLIC_API_KEY: '09mLQ6KO1k6vadXSBQWVR8JvLMH40oPw2HIRTZyW',
    NEXT_PUBLIC_AWS_REGION: 'us-east-2',
    NEXT_PUBLIC_AWS_USER_POOL_ID: 'us-east-2_Fpda5LMX0',
    NEXT_PUBLIC_AWS_POOL_CLIENT_ID: '5kvmdd29oj2lpnq9b4j60gfe69',
    NEXT_PUBLIC_APP_NAME: 'Urbex',
    NEXT_PUBLIC_APP_URL: 'https://urbex.com.co',
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

  // Merge config with environment file variables
  const finalConfig = { ...config, ...envVars };

  // Filter only NEXT_PUBLIC_ variables and NODE_ENV
  const publicVars = {};
  Object.entries(finalConfig).forEach(([key, value]) => {
    if (key.startsWith('NEXT_PUBLIC_') || key === 'NODE_ENV') {
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
    'NEXT_PUBLIC_API_BASE_URL',
    'NEXT_PUBLIC_API_KEY',
    'NEXT_PUBLIC_AWS_REGION',
    'NEXT_PUBLIC_AWS_USER_POOL_ID',
    'NEXT_PUBLIC_AWS_POOL_CLIENT_ID'
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
  loadEnvFile
}; 