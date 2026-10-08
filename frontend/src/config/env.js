/**
 * Centralized environment configuration
 */
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  IS_DEV: import.meta.env.DEV,
};
