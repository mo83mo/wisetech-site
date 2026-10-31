// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://wisetech.ca',
  integrations: [
    tailwind(),
    sitemap({
      // Keep noindex pages out of the sitemap
      filter: (page) => !page.includes('/signin'),
    }),
  ],
  output: 'static',
});
