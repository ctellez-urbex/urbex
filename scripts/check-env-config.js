#!/usr/bin/env node

/**
 * Script para verificar la configuración de variables de entorno
 * 
 * Uso:
 * node scripts/check-env-config.js
 * node scripts/check-env-config.js --env=production
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const envArg = args.find(arg => arg.startsWith('--env='));
const env = envArg ? envArg.split('=')[1] : 'development';

// Required environment variables
const REQUIRED_VARS = {
  frontend: [
    'NEXT_PUBLIC_API_BASE_URL',
    'NEXT_PUBLIC_API_KEY',
    'NEXT_PUBLIC_AWS_REGION',
    'NEXT_PUBLIC_AWS_USER_POOL_ID',
    'NEXT_PUBLIC_AWS_POOL_CLIENT_ID'
  ],
  backend: [
    'API_KEY',
    'ADMIN_API_KEY',
    'PUBLIC_API_KEY',
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_USER_POOL_ID',
    'AWS_POOL_CLIENT_ID',
    'MAILGUN_API_KEY',
    'MAILGUN_DOMAIN',
    'CONTACT_EMAIL'
  ]
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
 * Check if a value is valid
 * 
 * @param {string} key - Variable name
 * @param {string} value - Variable value
 * @returns {boolean} Is valid
 */
function isValidValue(key, value) {
  if (!value || value === 'undefined' || value === 'null') {
    return false;
  }

  // Check for placeholder values
  const placeholders = [
    'your_',
    'tu_',
    'placeholder',
    'example',
    'demo',
    'test'
  ];

  const lowerValue = value.toLowerCase();
  return !placeholders.some(placeholder => lowerValue.includes(placeholder));
}

/**
 * Validate environment variables
 * 
 * @param {Object} envVars - Environment variables
 * @param {string} type - 'frontend' or 'backend'
 * @returns {Object} Validation results
 */
function validateEnvVars(envVars, type) {
  const required = REQUIRED_VARS[type];
  const results = {
    valid: [],
    missing: [],
    invalid: []
  };

  required.forEach(key => {
    const value = envVars[key];
    
    if (!value) {
      results.missing.push(key);
    } else if (!isValidValue(key, value)) {
      results.invalid.push({ key, value });
    } else {
      results.valid.push(key);
    }
  });

  return results;
}

/**
 * Display validation results
 * 
 * @param {Object} results - Validation results
 * @param {string} type - 'frontend' or 'backend'
 */
function displayResults(results, type) {
  console.log(`\n📋 ${type.toUpperCase()} Environment Variables:`);
  console.log('='.repeat(50));

  if (results.valid.length > 0) {
    console.log(`✅ Valid (${results.valid.length}):`);
    results.valid.forEach(key => {
      console.log(`   ${key}`);
    });
  }

  if (results.missing.length > 0) {
    console.log(`\n❌ Missing (${results.missing.length}):`);
    results.missing.forEach(key => {
      console.log(`   ${key}`);
    });
  }

  if (results.invalid.length > 0) {
    console.log(`\n⚠️  Invalid (${results.invalid.length}):`);
    results.invalid.forEach(({ key, value }) => {
      console.log(`   ${key}: "${value}" (placeholder value)`);
    });
  }
}

/**
 * Check API configuration
 * 
 * @param {Object} envVars - Environment variables
 */
function checkApiConfig(envVars) {
  console.log('\n🔗 API Configuration Check:');
  console.log('='.repeat(50));

  const apiUrl = envVars.NEXT_PUBLIC_API_BASE_URL;
  const apiKey = envVars.NEXT_PUBLIC_API_KEY;

  if (apiUrl) {
    console.log(`🌐 API Base URL: ${apiUrl}`);
    
    if (apiUrl.startsWith('http://localhost')) {
      console.log('   ⚠️  Using localhost (development mode)');
    } else if (apiUrl.startsWith('https://')) {
      console.log('   ✅ Using HTTPS (production ready)');
    } else {
      console.log('   ⚠️  Not using HTTPS');
    }
  } else {
    console.log('❌ API Base URL: Not configured');
  }

  if (apiKey) {
    console.log(`🔑 API Key: ${apiKey.substring(0, 10)}... (configured)`);
  } else {
    console.log('❌ API Key: Not configured');
  }
}

/**
 * Check AWS configuration
 * 
 * @param {Object} envVars - Environment variables
 */
function checkAwsConfig(envVars) {
  console.log('\n☁️  AWS Configuration Check:');
  console.log('='.repeat(50));

  const region = envVars.NEXT_PUBLIC_AWS_REGION;
  const userPoolId = envVars.NEXT_PUBLIC_AWS_USER_POOL_ID;
  const clientId = envVars.NEXT_PUBLIC_AWS_POOL_CLIENT_ID;

  if (region) {
    console.log(`🌍 Region: ${region}`);
  } else {
    console.log('❌ Region: Not configured');
  }

  if (userPoolId) {
    console.log(`👥 User Pool ID: ${userPoolId}`);
  } else {
    console.log('❌ User Pool ID: Not configured');
  }

  if (clientId) {
    console.log(`🔐 Client ID: ${clientId}`);
  } else {
    console.log('❌ Client ID: Not configured');
  }
}

/**
 * Generate recommendations
 * 
 * @param {Object} frontendResults - Frontend validation results
 * @param {Object} backendResults - Backend validation results
 */
function generateRecommendations(frontendResults, backendResults) {
  console.log('\n💡 Recommendations:');
  console.log('='.repeat(50));

  const totalMissing = frontendResults.missing.length + backendResults.missing.length;
  const totalInvalid = frontendResults.invalid.length + backendResults.invalid.length;

  if (totalMissing > 0) {
    console.log('1. 📝 Generate missing environment variables:');
    console.log('   node scripts/generate-api-keys.js --env=' + env);
  }

  if (totalInvalid > 0) {
    console.log('2. 🔧 Replace placeholder values with real configuration');
  }

  if (frontendResults.missing.length > 0 || frontendResults.invalid.length > 0) {
    console.log('3. 📋 Copy env.example to .env.local and configure it');
  }

  console.log('4. 🔒 Ensure all API keys are secure and not committed to version control');
  console.log('5. 🌐 Test API connectivity after configuration');
}

/**
 * Main function
 */
function main() {
  console.log(`🔍 Checking environment configuration for ${env}...`);

  // Load environment files
  const envFiles = [
    '.env.local',
    '.env.development',
    '.env.staging',
    '.env.production',
    '.env'
  ];

  let envVars = {};
  
  for (const file of envFiles) {
    const filePath = path.join(process.cwd(), file);
    const fileVars = loadEnvFile(filePath);
    envVars = { ...envVars, ...fileVars };
  }

  // Validate frontend variables
  const frontendResults = validateEnvVars(envVars, 'frontend');
  displayResults(frontendResults, 'frontend');

  // Validate backend variables
  const backendResults = validateEnvVars(envVars, 'backend');
  displayResults(backendResults, 'backend');

  // Check specific configurations
  checkApiConfig(envVars);
  checkAwsConfig(envVars);

  // Generate recommendations
  generateRecommendations(frontendResults, backendResults);

  // Summary
  const totalRequired = REQUIRED_VARS.frontend.length + REQUIRED_VARS.backend.length;
  const totalValid = frontendResults.valid.length + backendResults.valid.length;
  const totalMissing = frontendResults.missing.length + backendResults.missing.length;
  const totalInvalid = frontendResults.invalid.length + backendResults.invalid.length;

  console.log('\n📊 Summary:');
  console.log('='.repeat(50));
  console.log(`Total required variables: ${totalRequired}`);
  console.log(`✅ Valid: ${totalValid}`);
  console.log(`❌ Missing: ${totalMissing}`);
  console.log(`⚠️  Invalid: ${totalInvalid}`);

  if (totalMissing === 0 && totalInvalid === 0) {
    console.log('\n🎉 All environment variables are properly configured!');
  } else {
    console.log('\n⚠️  Please fix the issues above before deploying.');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  loadEnvFile,
  validateEnvVars,
  isValidValue
}; 