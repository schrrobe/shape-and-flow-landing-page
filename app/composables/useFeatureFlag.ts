import { computed } from 'vue'

import type { ComputedRef } from 'vue'

export function useFeatureFlag(name: string, fallback = false): ComputedRef<boolean> {
  const featureFlags = useNuxtApp().$featureFlags

  return computed(() => {
    if (!featureFlags) return fallback
    // Register SDK update events as a dependency of this computed value.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    featureFlags.version.value
    if (!featureFlags.ready.value) return fallback
    return featureFlags.isEnabled(name, fallback)
  })
}
