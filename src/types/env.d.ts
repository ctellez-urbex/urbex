// Environment variables type definitions for static frontend

declare global {
  interface Window {
    ENV: {
      // API Externa Configuration
      NEXT_PUBLIC_API_BASE_URL: string;
      NEXT_PUBLIC_API_KEY: string;
      
      // AWS Configuration
      NEXT_PUBLIC_AWS_REGION: string;
      NEXT_PUBLIC_AWS_USER_POOL_ID: string;
      NEXT_PUBLIC_AWS_POOL_CLIENT_ID: string;
      
      // Application Configuration
      NEXT_PUBLIC_APP_NAME: string;
      NEXT_PUBLIC_APP_URL: string;
      
      // Environment
      NODE_ENV: string;
      [key: string]: string; // Allow dynamic access
    };
  }
}

export {}; 