import { defineConfig, devices } from '@playwright/test'

/*
 * Nur für die Barrierefreiheitsprüfung. Sie läuft gegen `nuxt preview`, also gegen dasselbe
 * Artefakt, das auch ausgeliefert wird — die Seiten sind vorgerendert, ein Dev-Server würde
 * anderes HTML zeigen.
 *
 * Ein echter Browser ist der Punkt der Übung: Kontrastverhältnisse, Sichtbarkeit und
 * Fokusreihenfolge lassen sich ohne Layout und Cascade nicht beurteilen, und genau die Regeln
 * bleiben bei einer Prüfung im simulierten DOM unentschieden.
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
    // Kein Build hier: im CI baut ein eigener Schritt davor, lokal reicht ein vorhandenes
    // .output. Der Server würde sonst bei jedem Lauf zwei Minuten warten.
    command: 'npm run preview',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
