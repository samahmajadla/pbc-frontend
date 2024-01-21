import { sveltekit } from '@sveltejs/kit/vite'
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $api: resolve('./src/lib/api'),
      $assets: resolve('./src/lib/assets'),
      $components: resolve('./src/lib/components'),
      $models: resolve('./src/lib/models'),
      $services: resolve('./src/lib/services'),
      $stores: resolve('./src/lib/stores'),
      $util: resolve('./src/lib/util'),
    },
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})
