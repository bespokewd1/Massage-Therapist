import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import { isIndexablePath } from './src/lib/seo-policy.mjs';

export default defineConfig({
  site: 'https://stonemassage.ca/',
  redirects: { '/book': { destination: '/booking/', status: 301 } },

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
  },
});
