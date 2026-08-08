import { defineConfig, devices } from '@playwright/test'

/*
 * For the accessibility check only. It runs against `nuxt preview`, i.e. against the same
 * artifact that gets delivered — the pages are prerendered, a dev server would show different
 * HTML.
 *
 * A real browser is the point of the exercise: contrast ratios, visibility and focus order cannot
 * be judged without layout and cascade, and those are exactly the rules that stay undecided when
 * checking in a simulated DOM.
 */
export default defineConfig({
  testDir: './test',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],

  use: {
    baseURL: 'http://127.0.0.1:3000',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    // No build here: in CI a separate step builds beforehand, locally an existing .output is
    // enough. Otherwise the server would wait two minutes on every run.
    command: 'npm run preview',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
