/**
 * Darf die Website auf die Booking-App verweisen?
 *
 * Hinter der Frage steht das Unleash-Flag `enable_booking_redirect`, ausgewertet beim Build von
 * modules/unleash.ts. Solange es aus ist, gibt es auf der ganzen Website keine Schaltfläche, die
 * dorthin führt, und auch keinen Text, der eine getrennte Buchungsseite erwähnt: wer nichts von
 * ihr weiß, sucht auch nicht danach.
 *
 * Bewusst ein einfacher Boolean und kein Ref. Der Wert steht beim Prerendering fest und kann
 * sich im Browser nicht mehr ändern, also gibt es auch nichts zu beobachten.
 */
export function useBuchungSichtbar(): boolean {
  return useRuntimeConfig().public.features.bookingRedirect
}
