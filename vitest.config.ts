import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    fileParallelism: false,
    // modules/ as well: the build-time conversion of the pages into Markdown has rules of its
    // own — for tables, collapsed FAQ entries and decoration — and those are worth a test.
    include: ['server/**/*.test.ts', 'app/**/*.test.ts', 'modules/**/*.test.ts'],
  },
})
