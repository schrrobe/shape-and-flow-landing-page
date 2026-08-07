import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    include: ['server/**/*.test.ts', 'app/**/*.test.ts'],
  },
})
