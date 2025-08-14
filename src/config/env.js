// Configuration for environment variables
// This file is compatible with both Vite and Jest testing environments

// Environment detection
const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

// For tests, use process.env fallbacks. For Vite, the build system will handle import.meta.env
const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000000,
  
  // Google Maps Configuration
  googleMaps: {
    apiKey: import.meta.env.VITE_GOOGLEMAP_API_KEY || 'AIzaSyAMA3VTBdscv_40tdyz0X4kfJKPG2i97QM',
    // Note: Map ID must be a valid ID from Google Cloud Console > Google Maps Platform > Map Styles
    mapId: import.meta.env.VITE_GOOGLEMAP_MAP_ID || '49c42cdb73def9de35db75de', // Default Map ID
    libraries: ['marker'], // Default libraries 
    version: 'beta' // Using beta for Advanced Markers
  },
  
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
  
  // Validate Google Maps configuration
  if (!config.googleMaps.apiKey) {
    console.warn('Google Maps API key is missing. Set VITE_GOOGLEMAP_API_KEY in your .env file.');
  }
  
  if (!import.meta.env.VITE_GOOGLEMAP_MAP_ID) {
    console.info('Using default Google Maps Map ID. Set VITE_GOOGLEMAP_MAP_ID in your .env file for a custom map style.');
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
      debugMode: config.debugMode,
      googleMaps: {
        apiKeyConfigured: !!config.googleMaps.apiKey,
        mapId: config.googleMaps.mapId,
        version: config.googleMaps.version
      }
    });
  }
};

export default config;
