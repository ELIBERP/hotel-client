// Configuration for environment variables
const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000000,
  
  // App Information
  appName: import.meta.env.VITE_APP_NAME || 'StayEase',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  
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

// Validate required environment variables
const validateConfig = () => {
  const requiredVars = ['VITE_API_BASE_URL'];
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
  }
  
  // Validate API URL format
  if (config.apiBaseUrl && !config.apiBaseUrl.match(/^https?:\/\//)) {
    console.warn('API base URL should include protocol (http:// or https://)');
  }
};

// Run validation in development
if (config.isDevelopment) {
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
  if (config.isDevelopment && config.debugMode) {
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
