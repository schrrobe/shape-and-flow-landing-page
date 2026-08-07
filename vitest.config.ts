import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    fileParallelism: false,
    include: ['server/**/*.test.ts', 'app/**/*.test.ts'],
  },
})
