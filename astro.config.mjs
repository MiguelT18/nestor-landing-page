// @ts-check
import { defineConfig } from 'astro/config'

import tailwind from '@astrojs/tailwind'

import icon from 'astro-icon'

import react from '@astrojs/react'

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: "server",

  devToolbar: {
    enabled: false
  },

  integrations: [tailwind(), icon(), react()],
  adapter: vercel()
})