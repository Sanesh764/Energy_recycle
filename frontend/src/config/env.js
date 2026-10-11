/**
 * Centralized environment configuration
 */
const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();

export const ENV = {
  // Normalize by removing trailing slash if provided by user/Amplify env
  API_BASE_URL: (rawApiBaseUrl || 'http://localhost:5000/api').replace(/\/+$/, ''),
  IS_DEV: import.meta.env.DEV,
};

