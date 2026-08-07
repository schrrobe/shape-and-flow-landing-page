import { defineNuxtModule, useLogger } from 'nuxt/kit'
import { destroy, startUnleash } from 'unleash-client'

/*
 * Fragt die Feature-Flags einmal beim Build ab und schreibt sie in die runtimeConfig.
 *
 * Warum beim Build und nicht zur Laufzeit: routeRules in nuxt.config.ts prerendert jede Seite,
 * das HTML steht also fest, sobald das Image gebaut ist. Ein Flag, das zur Laufzeit umspringt,
 * erreicht diese Seiten nicht mehr. Umschalten heißt deshalb neu bauen und ausrollen — genau
 * wie bei NUXT_SITE_URL, siehe Dockerfile.
 *
 * Warum das SDK und kein einfaches fetch auf die Client-API: ein Flag in Unleash ist nicht nur
 * an oder aus, sondern hat Aktivierungsstrategien. Die richtig auszuwerten ist die Aufgabe des
 * SDK. Die Umgebung — dev, stage, production — steckt dabei im Token, nicht in der Konfiguration.
 *
 * Das Paket ist eine devDependency: es läuft nur hier, und .output bekommt davon nichts mit.
 */

const FLAG = 'enable_booking_redirect'

/*
 * startUnleash gibt nicht auf, wenn der Server nicht antwortet, sondern fragt weiter nach. Ohne
 * eigene Frist bliebe der Build daran hängen, statt mit dem sicheren Standard weiterzulaufen.
 */
const FRIST_MS = 5000

async function flagAbfragen(url: string, token: string, appName: string): Promise<boolean> {
  try {
    const unleash = await Promise.race([
      startUnleash({
        url,
        appName,
        customHeaders: { Authorization: token },
        // Ein Build ist kein laufender Dienst: Nutzungszahlen aus ihm würden die Statistik in
        // Unleash verfälschen, nicht ergänzen.
        disableMetrics: true,
        timeout: FRIST_MS,
      }),
      new Promise<never>((_, ablehnen) => {
        setTimeout(() => ablehnen(new Error(`keine Antwort nach ${FRIST_MS} ms`)), FRIST_MS)
      }),
    ])

    return unleash.isEnabled(FLAG)
  } finally {
    // Auch im Fehlerfall: der Abfrage-Timer des SDK hält sonst den Node-Prozess des Builds offen.
    destroy()
  }
}

export default defineNuxtModule({
  meta: { name: 'unleash' },

  async setup(_optionen, nuxt) {
    // useLogger und nicht console: schreibt mit demselben Präfix wie die übrigen Module und
    // fügt sich in die Ausgabe des Builds ein, statt zwischen ihr zu stehen.
    const log = useLogger('unleash')

    const url = process.env.UNLEASH_URL
    const token = process.env.UNLEASH_TOKEN
    const appName = process.env.UNLEASH_APP_NAME || 'shape-and-flow-landing-page'

    /*
     * Ohne Zugangsdaten oder ohne erreichbaren Server bleibt es beim Standard aus nuxt.config.ts,
     * und der ist aus. Der Build bricht bewusst nicht ab: eine ausgeblendete Schaltfläche ist ein
     * kleinerer Schaden als ein blockiertes Deploy — und ein Link auf eine Booking-App, die es
     * vielleicht noch gar nicht gibt, wäre der größere.
     */
    if (!url || !token) {
      log.warn(`UNLEASH_URL oder UNLEASH_TOKEN fehlt. ${FLAG} bleibt aus.`)
      return
    }

    try {
      const aktiv = await flagAbfragen(url, token, appName)
      nuxt.options.runtimeConfig.public.features.bookingRedirect = aktiv
      log.info(`${FLAG}: ${aktiv ? 'an' : 'aus'}`)
    } catch (fehler) {
      const grund = fehler instanceof Error ? fehler.message : String(fehler)
      log.warn(`${FLAG} nicht abfragbar (${grund}). Bleibt aus.`)
    }
  },
})
