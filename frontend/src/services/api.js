import { ENV } from '../config/env';

/**
 * API SERVICE ABSTRACTION LAYER
 * 
 * Centralizes all HTTP communication with the backend.
 * Uses VITE_API_BASE_URL (defaults to http://localhost:5000/api).
 * 
 * Future endpoints specified in SPEC.md:
 * - GET  /health
 * - POST /uploads/presign
 * - POST /devices
 * - GET  /devices
 * - GET  /devices/:id
 * - POST /devices/:id/pickup
 * - GET  /pickups?status=REQUESTED
 * - POST /pickups/:id/accept
 * - POST /pickups/:id/collected
 * - POST /devices/:id/inspect
 * - POST /devices/:id/complete
 * - POST /devices/:id/cancel
 * - GET  /admin/stats
 */

class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const url = `${ENV.API_BASE_URL}${path}`;
  const token = localStorage.getItem('ewaste_auth_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorData.message || errorMsg;
      } catch {
        // Response was not JSON
      }
      throw new ApiError(errorMsg, response.status);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network request failed', 0);
  }
}

export const healthApi = {
  getHealth: () => request('/health', { method: 'GET' }),
};

export const uploadsApi = {
  getPresignedUrl: ({ contentType }) =>
    request('/uploads/presign', {
      method: 'POST',
      body: JSON.stringify({ contentType }),
    }),
};

export const devicesApi = {
  createDevice: (payload) =>
    request('/devices', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getDevices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/devices${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  getDeviceById: (id) => request(`/devices/${id}`, { method: 'GET' }),
  requestPickup: (id, payload) =>
    request(`/devices/${id}/pickup`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  inspectDevice: (id, payload) =>
    request(`/devices/${id}/inspect`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  completeDevice: (id) =>
    request(`/devices/${id}/complete`, { method: 'POST' }),
  cancelDevice: (id) =>
    request(`/devices/${id}/cancel`, { method: 'POST' }),
};

export const pickupsApi = {
  getOpenPickups: (params = { status: 'REQUESTED' }) => {
    const query = new URLSearchParams(params).toString();
    return request(`/pickups?${query}`, { method: 'GET' });
  },
  acceptPickup: (id) =>
    request(`/pickups/${id}/accept`, { method: 'POST' }),
  markCollected: (id) =>
    request(`/pickups/${id}/collected`, { method: 'POST' }),
};

export const adminApi = {
  getStats: () => request('/admin/stats', { method: 'GET' }),
};
