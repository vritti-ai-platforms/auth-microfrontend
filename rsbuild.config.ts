import fs from 'node:fs';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

const useHttps = process.env.USE_HTTPS === 'true';

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
        key: fs.readFileSync('./certs/local.vrittiai.com+4-key.pem'),
        cert: fs.readFileSync('./certs/local.vrittiai.com+4.pem'),
      },
    }),
    proxy: {
      '/api': {
        target: process.env.REACT_API_HOST || 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
  },
  plugins: [
    pluginReact(),
    {
      name: 'plugin-manifest-message',
      setup: (api) => {
        api.onAfterStartDevServer(({ port }: { port: number }) => {
          api.logger.info(`➜  Manifest: ${useHttps ? 'https' : 'http'}://local.vrittiai.com:${port}/mf-manifest.json`);
        });
      },
    },
    pluginModuleFederation({
      name: 'vritti_auth',
      exposes: {
        './routes': './src/routes.tsx',
      },
      shared: {
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
        axios: {
          singleton: true,
          eager: true,
        },
        '@tanstack/react-query': {
          singleton: true,
          eager: true,
        },
      },
      dts: false, // Disable DTS generation to avoid issues with malformed type declarations
    }),
  ],
  // PostCSS configuration is in postcss.config.mjs
});
