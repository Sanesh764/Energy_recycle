/**
 * Centralized environment configuration
 */
let rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();

// Strip any trailing slashes
rawApiBaseUrl = rawApiBaseUrl.replace(/\/+$/, '');

// If user provides root domain without /api (e.g. http://domain.elasticbeanstalk.com), auto-append /api
if (rawApiBaseUrl && !rawApiBaseUrl.endsWith('/api')) {
  rawApiBaseUrl = `${rawApiBaseUrl}/api`;
}

export const ENV = {
  API_BASE_URL: rawApiBaseUrl || 'http://localhost:5000/api',
  IS_DEV: import.meta.env.DEV,
};


