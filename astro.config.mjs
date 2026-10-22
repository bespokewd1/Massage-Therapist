import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import { isIndexablePath } from './src/lib/seo-policy.mjs';

export default defineConfig({
  site: 'https://stonemassage.ca/',
  redirects: {
    '/book': { destination: 'https://stonemassage.ca/booking/', status: 301 },
  },

  build: {
    inlineStylesheets: 'auto',
  },

  experimental: {
    fonts: [
      {
        provider: fontProviders.local(),
        name: 'Open Sans',
        cssVariable: '--font-open-sans',
        display: 'swap',
        // Preserve the existing Roboto/Arial fallback chain in root.less.
        fallbacks: [],
        optimizedFallbacks: false,
        options: {
          variants: [
            {
              weight: 400,
              style: 'normal',
              src: ['./src/assets/fonts/open-sans-v40-latin-regular.woff2'],
            },
            {
              weight: 500,
              style: 'normal',
              src: ['./src/assets/fonts/open-sans-v40-latin-500.woff2'],
            },
            {
              weight: 600,
              style: 'normal',
              src: ['./src/assets/fonts/open-sans-v40-latin-600.woff2'],
            },
            {
              weight: 700,
              style: 'normal',
              src: ['./src/assets/fonts/open-sans-v40-latin-700.woff2'],
            },
            {
              weight: 800,
              style: 'normal',
              src: ['./src/assets/fonts/open-sans-v40-latin-800.woff2'],
            },
          ],
        },
      },
      {
        provider: fontProviders.local(),
        name: 'Poppins',
        cssVariable: '--font-poppins',
        display: 'swap',
        fallbacks: [],
        optimizedFallbacks: false,
        options: {
          variants: [
            {
              weight: 400,
              style: 'normal',
              src: ['./src/assets/fonts/poppins-400.woff2'],
            },
          ],
        },
      },
    ],
  },

  integrations: [
    icon(),
    sitemap({
      filter: (page) => isIndexablePath(new URL(page).pathname),
      changefreq: 'weekly',
      priority: 0.7,
    }),
    react(),
  ],

  vite: {
    plugins: [tailwindcss()],
    build: {
      assetsInlineLimit(filePath, content) {
        // Inline small compiled styles without changing image/font inlining.
        if (filePath.endsWith('.css')) return content.length < 20 * 1024;
        return undefined;
      },
    },
  },
});
