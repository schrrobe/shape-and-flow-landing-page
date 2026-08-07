import { initialize } from 'unleash-client'

import type { Context, UnleashConfig } from 'unleash-client'

export interface ServerFeatureFlagConfig {
  url: string
  backendToken: string
  environment: string
  deployment: string
}

export interface ServerFeatureFlagClient {
  isEnabled(name: string, context?: Context, fallbackValue?: boolean): boolean
  on(event: 'error' | 'warn', listener: (value: unknown) => void): void
  destroy(): void
}

export type ServerFeatureFlagClientFactory = (config: UnleashConfig) => ServerFeatureFlagClient

export interface ServerFeatureFlags {
  start(config: ServerFeatureFlagConfig | undefined): void
  stop(): void
  isEnabled(name: string, context?: Context, fallback?: boolean): boolean
}

const environments = new Set(['development', 'production'])
const deployments = new Set(['dev', 'stage', 'production'])

const defaultFactory: ServerFeatureFlagClientFactory = config => initialize(config)

export function createServerFeatureFlags(
  factory: ServerFeatureFlagClientFactory = defaultFactory,
): ServerFeatureFlags {
  let client: ServerFeatureFlagClient | undefined
  let deployment: string | undefined

  return {
    start(config): void {
      if (client || !config) return
      if (
        !config.url ||
        !config.backendToken ||
        !environments.has(config.environment) ||
        !deployments.has(config.deployment)
      ) {
        console.warn('Unleash server configuration is incomplete')
        return
      }

      try {
        client = factory({
          appName: 'shape-and-flow-landing-server',
          url: config.url,
          environment: config.environment,
          customHeaders: { Authorization: config.backendToken },
        })
        deployment = config.deployment
        client.on('error', error => {
          console.warn('Unleash server SDK error', error)
        })
        client.on('warn', warning => {
          console.warn('Unleash server SDK warning', warning)
        })
      } catch (error) {
        console.warn('Unleash server initialization failed', error)
      }
    },

    stop(): void {
      client?.destroy()
      client = undefined
      deployment = undefined
    },

    isEnabled(name, context = {}, fallback = false): boolean {
      if (!client || !deployment) return fallback

      try {
        return client.isEnabled(
          name,
          {
            ...context,
            properties: {
              ...context.properties,
              deployment,
            },
          },
          fallback,
        )
      } catch (error) {
        console.warn('Unleash server evaluation failed', error)
        return fallback
      }
    },
  }
}

export const serverFeatureFlags = createServerFeatureFlags()

export function isFeatureEnabled(
  name: string,
  context: Context = {},
  fallback = false,
): boolean {
  return serverFeatureFlags.isEnabled(name, context, fallback)
}
