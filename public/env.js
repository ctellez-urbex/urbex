// Environment Configuration for Static Frontend
// Generated for development environment on 2025-07-15T21:18:44.586Z
// This file is loaded by the frontend to access environment variables
// It's generated during build time and served as static content

window.ENV = {
  "NEXT_PUBLIC_API_BASE_URL": "https://eo6cj32bch.execute-api.us-east-2.amazonaws.com/prod/api/v1",
  "NEXT_PUBLIC_API_KEY": "09mLQ6KO1k6vadXSBQWVR8JvLMH40oPw2HIRTZyW",
  "NEXT_PUBLIC_AWS_REGION": "us-east-2",
  "NEXT_PUBLIC_AWS_USER_POOL_ID": "us-east-2_Fpda5LMX0",
  "NEXT_PUBLIC_AWS_POOL_CLIENT_ID": "dev_client_id_here",
  "NEXT_PUBLIC_APP_NAME": "Urbex",
  "NEXT_PUBLIC_APP_URL": "http://localhost:3000",
  "NODE_ENV": "development"
};

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
