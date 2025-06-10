// src/utils/envConfig.js
/**
 * Environment configuration utility
 * Handles different API base URLs for development and production
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API Configuration
export const API_CONFIG = {
  // Use proxy in development to avoid CORS, direct URL in production
  BASE_URL: isDevelopment
    ? "http://localhost:5173/api/"
    : import.meta.env.VITE_API_BASE_URL || "https://giasuvlu.click/api/",

  TIMEOUT: 10000,

  // CORS settings
  WITH_CREDENTIALS: false,

  // Debug settings
  LOG_REQUESTS: isDevelopment,
  LOG_RESPONSES: isDevelopment,
};

// Environment info
export const ENV_INFO = {
  isDevelopment,
  isProduction,
  nodeEnv: import.meta.env.NODE_ENV || "development",
  apiBaseUrl: API_CONFIG.BASE_URL,
  mode: import.meta.env.MODE,
};

// Utility functions
export const getApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.BASE_URL;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${baseUrl}${cleanEndpoint}`;
};

export const logApiCall = (method, url, data = null) => {
  if (API_CONFIG.LOG_REQUESTS) {
    console.log(`🌐 [API ${method.toUpperCase()}]`, url, data ? { data } : "");
  }
};

export const logApiResponse = (
  method,
  url,
  status,
  duration = 0,
  data = null
) => {
  if (API_CONFIG.LOG_RESPONSES) {
    const dataSize = JSON.stringify(data || {}).length;
    console.log(
      `✅ [API ${method.toUpperCase()}] ${status}`,
      url,
      `(${duration}ms, ${dataSize} bytes)`
    );
  }
};

export const logApiError = (method, url, status, duration = 0, errorData) => {
  if (API_CONFIG.LOG_REQUESTS) {
    // Use same flag as requests for now
    console.error(
      `❌ [API ${method.toUpperCase()}] ${status || "ERR"}`,
      url,
      `(${duration}ms)`,
      errorData || "Unknown error"
    );
  }
};

// Export for debugging in console
if (typeof window !== "undefined") {
  window.ENV_INFO = ENV_INFO;
  window.API_CONFIG = API_CONFIG;
}

export default {
  API_CONFIG,
  ENV_INFO,
  getApiUrl,
  logApiCall,
  logApiResponse,
  logApiError,
};
