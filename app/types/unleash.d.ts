import type { BrowserFeatureFlags } from '../plugins/unleash.client'

declare module '#app' {
  interface NuxtApp {
    $featureFlags: BrowserFeatureFlags
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $featureFlags: BrowserFeatureFlags
  }
}

export {}
