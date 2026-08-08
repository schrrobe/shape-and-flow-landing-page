import type { ComputedRef } from 'vue'

/**
 * May the site point at the booking app?
 *
 * Behind the question sits the Unleash flag `enable_booking_redirect`. While it is off there is
 * no button anywhere on the site that leads there, and no copy mentioning a separate booking
 * page either: whoever does not know about it will not look for it.
 *
 * The fallback is deliberately `false` and not merely the default of useFeatureFlag: until the
 * browser SDK is ready — and during prerendering forever, since there is no $featureFlags there
 * — the state without a booking app applies. A pointer to a booking flow that may not even exist
 * yet would be the more expensive mistake than a button that is briefly missing.
 *
 * Its own composable instead of calling useFeatureFlag in twelve places: this way the flag name
 * appears exactly once in the code, and the pages ask about the thing rather than the switch.
 */
export function useBookingVisible(): ComputedRef<boolean> {
  return useFeatureFlag('enable_booking_redirect', false)
}
