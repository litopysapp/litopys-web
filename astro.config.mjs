// @ts-check
import { defineConfig } from 'astro/config';

import node from '@astrojs/node';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  redirects: {
    '/funktsii': '/litopys/funktsii',
    '/yak-pratsyuye': '/litopys/yak-pratsyuye',
    '/shcho-potribno': '/litopys/shcho-potribno',
    '/tsiny': '/litopys/tsiny',
    '/demo': '/litopys/demo',
    '/shrifty': '/litopys/shrifty',
  }
});