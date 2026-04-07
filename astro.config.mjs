import { defineConfig } from 'astro/config';

// Production URL — used for absolute URLs when needed. Override via Astro env if required.
export default defineConfig({
  site: 'https://www.thevaultgym.co.uk',
  build: {
    format: 'file',
  },
});
