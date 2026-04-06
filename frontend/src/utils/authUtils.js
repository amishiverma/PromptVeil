/**
 * Auth Utilities
 * Helper functions for authenticated API calls and token management
 */

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/**
 * Get the stored auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Get the stored user data
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Make an authenticated API call
 * Automatically adds Bearer token to Authorization header
 */
export const authenticatedFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If token is invalid (401), clear storage and redirect to login
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return null;
  }

  return response;
};

/**
 * Analyze a prompt for threats
 */
export const analyzePrompt = async (prompt, history = []) => {
  const response = await authenticatedFetch('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({
      prompt,
      history,
    }),
  });

  if (!response) return null;
  return response.json();
};

/**
 * Send a secure chat message with optional file
 */
export const secureChat = async (prompt, history = [], file = null) => {
  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('history', JSON.stringify(history));
  
  if (file) {
    formData.append('file', file);
  }

  const token = getAuthToken();
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/secure-chat`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return null;
  }

  return response.json();
};

/**
 * Get current user info from backend
 */
export const getCurrentUser = async () => {
  const response = await authenticatedFetch('/auth/user');

  if (!response) return null;
  return response.json();
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Clear all auth data (logout)
 */
export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};
