import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createServerFeatureFlags,
  type ServerFeatureFlagClient,
  type ServerFeatureFlagClientFactory,
} from './feature-flags'

const config = {
  url: 'https://unleash.shapeandflow.de/api/',
  backendToken: 'backend-test-token',
  environment: 'development' as const,
  deployment: 'stage' as const,
}

const fakeClient = () => {
  const listeners = new Map<string, ((value: unknown) => void)[]>()
  const isEnabled = vi.fn().mockReturnValue(true)
  const destroy = vi.fn()
  const on = vi.fn((event: string, listener: (value: unknown) => void) => {
    listeners.set(event, [...(listeners.get(event) ?? []), listener])
  })
  const client: ServerFeatureFlagClient = { isEnabled, destroy, on }

  return { client, listeners, isEnabled, destroy }
}

describe('createServerFeatureFlags', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes one scoped SDK client without waiting for synchronization', () => {
    const { client } = fakeClient()
    const factory = vi.fn<ServerFeatureFlagClientFactory>().mockReturnValue(client)
    const flags = createServerFeatureFlags(factory)

    expect(flags.start(config)).toBeUndefined()
    flags.start(config)

    expect(factory).toHaveBeenCalledOnce()
    expect(factory).toHaveBeenCalledWith({
      appName: 'shape-and-flow-landing-server',
      url: 'https://unleash.shapeandflow.de/api/',
      environment: 'development',
      customHeaders: { Authorization: 'backend-test-token' },
    })
  })

  it('injects deployment context and forwards the explicit fallback', () => {
    const { client, isEnabled } = fakeClient()
    const flags = createServerFeatureFlags(() => client)
    flags.start(config)

    expect(
      flags.isEnabled(
        'landing.new-hero',
        { userId: 'visitor-1', properties: { locale: 'de' } },
        false,
      ),
    ).toBe(true)
    expect(isEnabled).toHaveBeenCalledWith(
      'landing.new-hero',
      { userId: 'visitor-1', properties: { locale: 'de', deployment: 'stage' } },
      false,
    )
  })

  it('defaults to disabled when configuration is absent', () => {
    const factory = vi.fn<ServerFeatureFlagClientFactory>()
    const flags = createServerFeatureFlags(factory)

    flags.start(undefined)

    expect(flags.isEnabled('landing.new-hero')).toBe(false)
    expect(flags.isEnabled('landing.new-hero', {}, true)).toBe(true)
    expect(factory).not.toHaveBeenCalled()
  })

  it.each([
    ['development', 'production'],
    ['production', 'dev'],
    ['production', 'stage'],
  ])('rejects the invalid %s/%s pair before SDK startup', (environment, deployment) => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const factory = vi.fn<ServerFeatureFlagClientFactory>()
    const flags = createServerFeatureFlags(factory)

    flags.start({ ...config, environment, deployment })

    expect(factory).not.toHaveBeenCalled()
    expect(flags.isEnabled('landing.new-hero')).toBe(false)
  })

  it('isolates initialization, SDK event, and evaluation errors', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const startup = createServerFeatureFlags(() => {
      throw new Error('cannot initialize')
    })

    expect(() => startup.start(config)).not.toThrow()
    expect(startup.isEnabled('landing.new-hero')).toBe(false)

    const { client, listeners, isEnabled } = fakeClient()
    const running = createServerFeatureFlags(() => client)
    running.start(config)
    expect(() => listeners.get('error')?.[0]?.(new Error('poll failed'))).not.toThrow()
    expect(() => listeners.get('warn')?.[0]?.('stale data')).not.toThrow()
    isEnabled.mockImplementation(() => {
      throw new Error('evaluation failed')
    })
    expect(running.isEnabled('landing.new-hero', {}, true)).toBe(true)
    expect(warning).toHaveBeenCalledTimes(4)
  })

  it('destroys the SDK client during Nitro shutdown', () => {
    const { client, destroy } = fakeClient()
    const flags = createServerFeatureFlags(() => client)
    flags.start(config)

    flags.stop()

    expect(destroy).toHaveBeenCalledOnce()
  })
})
