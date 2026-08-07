import { UnleashClient } from 'unleash-proxy-client'
import { readonly, ref } from 'vue'

import type { IConfig } from 'unleash-proxy-client'
import type { Ref } from 'vue'

type Listener = (value?: unknown) => void

export interface BrowserFeatureFlagConfig {
  url: string
  frontendToken: string
  environment: string
  deployment: string
}

export interface BrowserFeatureFlagSdk {
  start(): Promise<void>
  stop(): void
  isEnabled(name: string): boolean
  on(event: 'ready' | 'update' | 'error', listener: Listener): void
  off(event: 'ready' | 'update' | 'error', listener: Listener): void
}

export type BrowserFeatureFlagSdkFactory = (config: IConfig) => BrowserFeatureFlagSdk

export interface BrowserFeatureFlags {
  readonly ready: Readonly<Ref<boolean>>
  readonly version: Readonly<Ref<number>>
  start(): Promise<void>
  stop(): void
  isEnabled(name: string, fallback?: boolean): boolean
}

const environments = new Set(['development', 'production'])
const deployments = new Set(['dev', 'stage', 'production'])
const defaultFactory: BrowserFeatureFlagSdkFactory = config => new UnleashClient(config)
const reportFeatureFlagWarning = (message: string, detail?: unknown): void => {
  // Browser SDK failures are operational diagnostics; no token is included.
  // eslint-disable-next-line no-console
  console.warn(message, detail)
}

export function createBrowserFeatureFlags(
  config: BrowserFeatureFlagConfig,
  factory: BrowserFeatureFlagSdkFactory = defaultFactory,
): BrowserFeatureFlags {
  const ready = ref(false)
  const version = ref(0)
  let sdk: BrowserFeatureFlagSdk | undefined
  let startPromise: Promise<void> | undefined

  const onReady = (): void => {
    ready.value = true
    version.value += 1
  }
  const onUpdate = (): void => {
    version.value += 1
  }
  const onError = (error?: unknown): void => {
    reportFeatureFlagWarning('Unleash browser SDK error', error)
  }

  return {
    ready: readonly(ready),
    version: readonly(version),

    start(): Promise<void> {
      startPromise ??= (async () => {
        if (
          !config.url ||
          !config.frontendToken ||
          !environments.has(config.environment) ||
          !deployments.has(config.deployment)
        ) {
          reportFeatureFlagWarning('Unleash browser configuration is incomplete')
          return
        }

        try {
          sdk = factory({
            url: config.url,
            clientKey: config.frontendToken,
            appName: 'shape-and-flow-landing-web',
            environment: config.environment,
            context: { properties: { deployment: config.deployment } },
          })
          sdk.on('ready', onReady)
          sdk.on('update', onUpdate)
          sdk.on('error', onError)
          await sdk.start()
        } catch (error) {
          reportFeatureFlagWarning('Unleash browser initialization failed', error)
        }
      })()

      return startPromise
    },

    stop(): void {
      if (!sdk) return
      sdk.off('ready', onReady)
      sdk.off('update', onUpdate)
      sdk.off('error', onError)
      sdk.stop()
      sdk = undefined
      ready.value = false
    },

    isEnabled(name, fallback = false): boolean {
      if (!ready.value || !sdk) return fallback

      try {
        return sdk.isEnabled(name)
      } catch (error) {
        reportFeatureFlagWarning('Unleash browser evaluation failed', error)
        return fallback
      }
    },
  }
}

export default defineNuxtPlugin(nuxtApp => {
  const runtimeConfig = useRuntimeConfig()
  const featureFlags = createBrowserFeatureFlags(runtimeConfig.public.unleash)

  nuxtApp.vueApp.onUnmount(() => {
    featureFlags.stop()
  })
  void featureFlags.start()

  return {
    provide: { featureFlags },
  }
})
