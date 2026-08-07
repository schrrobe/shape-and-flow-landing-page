import type { ComputedRef } from 'vue'

/**
 * Darf die Website auf die Booking-App verweisen?
 *
 * Hinter der Frage steht das Unleash-Flag `enable_booking_redirect`. Solange es aus ist, gibt es
 * auf der ganzen Website keine Schaltfläche, die dorthin führt, und auch keinen Text, der eine
 * getrennte Buchungsseite erwähnt: wer nichts von ihr weiß, sucht auch nicht danach.
 *
 * Der Fallback ist bewusst `false` und nicht bloß der Vorgabewert von useFeatureFlag: bis das
 * Browser-SDK bereit ist — und beim Prerendering für immer, dort gibt es kein $featureFlags —
 * gilt der Zustand ohne Booking-App. Ein Verweis auf eine Buchungsstrecke, die vielleicht noch
 * gar nicht steht, wäre der teurere Fehler als eine Schaltfläche, die kurz fehlt.
 *
 * Eigenes Composable und nicht useFeatureFlag an zwölf Stellen direkt: der Flag-Name steht damit
 * genau einmal im Code, und die Seiten fragen nach der Sache statt nach dem Schalter.
 */
export function useBuchungSichtbar(): ComputedRef<boolean> {
  return useFeatureFlag('enable_booking_redirect', false)
}
