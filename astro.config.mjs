// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Canonical address; mtrobotix.com redirects here.
  site: 'https://www.mtrobotix.com',
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'always' },
  // URLs from the previous site keep working for existing links and search results.
  redirects: {
    '/request-a-demo': '/contact/',
    '/solutions/inspection': '/mtr-q/',
    '/solutions/amr-fleet': '/amr/',
    '/solutions/retrofit': '/mtr-q/',
    '/vi/request-a-demo': '/vi/contact/',
    '/vi/solutions/inspection': '/vi/mtr-q/',
    '/vi/solutions/amr-fleet': '/vi/amr/',
    '/vi/solutions/retrofit': '/vi/mtr-q/',
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', vi: 'vi' } },
      filter: (page) => !/\/(request-a-demo|solutions\/[^/]+)\/?$/.test(page),
    }),
  ],
});
