import { defineConfig } from '@vritti/quantum-ui';

/**
 * quantum-ui configuration for vritti-auth
 *
 * This file configures quantum-ui's behavior for the authentication microfrontend.
 * Similar to tailwind.config.js, this provides centralized configuration.
 */
export default defineConfig({
  /**
   * CSRF Token Configuration
   * Automatically fetched from the backend when needed
   */
  csrf: {
    endpoint: '/csrf/token',
    enabled: true,
    headerName: 'x-csrf-token',
  },

  /**
   * Axios HTTP Client Configuration
   * Base settings for all API requests
   */
  axios: {
    baseURL: '/api',
    timeout: 30000, // 30 seconds
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  },

  /**
   * Authentication Configuration
   * Controls how auth tokens are formatted in requests
   */
  auth: {
    tokenHeaderName: 'Authorization',
    tokenPrefix: 'Bearer',
    tokenEndpoint: 'cloud-api/auth/token',
    refreshEndpoint: 'cloud-api/auth/refresh',
    sessionRecoveryEnabled: true,
  },
});
