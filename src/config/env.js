// Configuration for environment variables
// This file is compatible with both Vite and Jest testing environments

// Environment detection
const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

// For tests, use process.env fallbacks. For Vite, the build system will handle import.meta.env
const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  
  // App Information
  appName: isTestEnvironment 
    ? (process.env.VITE_APP_NAME || 'StayEase')
    : 'StayEase',
  appVersion: isTestEnvironment 
    ? (process.env.VITE_APP_VERSION || '1.0.0')
    : '1.0.0',
  
  // Environment
  isDevelopment: isTestEnvironment ? true : true, // Default for tests
  isProduction: isTestEnvironment ? false : false,
  debugMode: isTestEnvironment 
    ? (process.env.VITE_DEBUG_MODE === 'true')
    : false,
  
  // API Endpoints
  endpoints: {
    auth: '/auth',
    hotels: '/hotels',
    bookings: '/bookings',
    search: '/search',  
    user: '/user',
    payment: '/api/payment'
  }
};

// Validate required environment variables (only in development, not in tests)
const validateConfig = () => {
  if (isTestEnvironment) return; // Skip validation in tests
  
  const requiredVars = ['VITE_API_BASE_URL'];
  
  // In production build, these checks would use import.meta.env
  if (config.apiBaseUrl && !config.apiBaseUrl.match(/^https?:\/\//)) {
    console.warn('API base URL should include protocol (http:// or https://)');
  }
};

// Run validation in development (but not in tests)
if (config.isDevelopment && !isTestEnvironment) {
  validateConfig();
}

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  const baseUrl = config.apiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Helper function to get API endpoint
export const getApiEndpoint = (key) => {
  return config.endpoints[key] || key;
};

// Security helper - logs environment info (development only)
export const logEnvironmentInfo = () => {
  if (config.isDevelopment && config.debugMode && !isTestEnvironment) {
    console.log('Environment Configuration:', {
      apiBaseUrl: config.apiBaseUrl,
      appName: config.appName,
      appVersion: config.appVersion,
      isDevelopment: config.isDevelopment,
      debugMode: config.debugMode
    });
  }
};

export default config;
