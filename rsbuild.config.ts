import { readFileSync } from 'node:fs';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig, type RsbuildPlugin } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Environment configuration
const useHttps = process.env.USE_HTTPS === 'true';
const protocol = useHttps ? 'https' : 'http';
const host = 'cloud.local.vrittiai.com';
const defaultApiHost = `${protocol}://${host}:3000`;

// Shared dependencies configuration for Module Federation
const SHARED_DEPENDENCIES = {
  react: {
    singleton: true,
    requiredVersion: '^19.2.0',
    eager: true,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: '^19.2.0',
    eager: true,
  },
  'react-router-dom': {
    singleton: true,
    eager: true,
  },
  '@vritti/quantum-ui': {
    singleton: true,
    eager: true,
  },
  '@vritti/quantum-ui/theme': {
    singleton: true,
    eager: true,
  },
  axios: {
    singleton: true,
    eager: true,
  },
  '@tanstack/react-query': {
    singleton: true,
    eager: true,
  },
} as const;

// Custom plugin to log manifest URL on dev server start
const manifestMessagePlugin: RsbuildPlugin = {
  name: 'plugin-manifest-message',
  setup: (api) => {
    api.onAfterStartDevServer(({ port }) => {
      api.logger.info(`➜  Manifest: ${protocol}://${host}:${port}/mf-manifest.json`);
    });
  },
};

export default defineConfig({
  output: {
    assetPrefix: '/auth-microfrontend/',
  },
  dev: {
    writeToDisk: true, // Write build outputs to disk in dev mode
  },
  server: {
    port: 3001,
    ...(useHttps && {
      https: {
        key: readFileSync('./certs/local.vrittiai.com+4-key.pem'),
        cert: readFileSync('./certs/local.vrittiai.com+4.pem'),
      },
    }),
    proxy: {
      '/api': {
        target: process.env.PUBLIC_API_URL || defaultApiHost,
        changeOrigin: true,
        secure: false,
        pathRewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    pluginReact(),
    manifestMessagePlugin,
    pluginModuleFederation({
      name: 'vritti_auth',
      exposes: {
        './routes': './src/routes.tsx',
      },
      shared: SHARED_DEPENDENCIES,
      dts: false, // Disable DTS generation to avoid issues with malformed type declarations
    }),
  ],
  // PostCSS configuration is in postcss.config.mjs
});
