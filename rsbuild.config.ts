import { readFileSync } from 'node:fs';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Environment configuration
const useHttps = process.env.USE_HTTPS === 'true';
const protocol = useHttps ? 'https' : 'http';
const host = 'cloud.local.vrittiai.com';
const defaultApiHost = `${protocol}://${host}:3000`;

export default defineConfig({
  output: {
    assetPrefix: '/cloud-web/',
  },
  resolve: {
    alias: {
      react: require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
      'react-router-dom': require.resolve('react-router-dom'),
      '@tanstack/react-query': require.resolve('@tanstack/react-query'),
    },
  },
  dev: {
    writeToDisk: true, // Write build outputs to disk in dev mode
  },
  server: {
    port: 3012,
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
  plugins: [pluginReact()],
  // PostCSS configuration is in postcss.config.mjs
});
