import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createBrowserFeatureFlags,
  type BrowserFeatureFlagSdk,
  type BrowserFeatureFlagSdkFactory,
} from '../plugins/unleash.client'
import { useFeatureFlag } from './useFeatureFlag'

const config = {
  url: 'https://unleash.shapeandflow.de/api/frontend',
  frontendToken: 'frontend-test-token',
  environment: 'development',
  deployment: 'stage',
}

const fakeSdk = () => {
  const listeners = new Map<string, ((value?: unknown) => void)[]>()
  const start = vi.fn().mockResolvedValue(undefined)
  const stop = vi.fn()
  const isEnabled = vi.fn().mockReturnValue(true)
  const on = vi.fn((event: string, listener: (value?: unknown) => void) => {
    listeners.set(event, [...(listeners.get(event) ?? []), listener])
  })
  const off = vi.fn((event: string, listener: (value?: unknown) => void) => {
    listeners.set(
      event,
      (listeners.get(event) ?? []).filter(candidate => candidate !== listener),
    )
  })
  const sdk: BrowserFeatureFlagSdk = { start, stop, isEnabled, on, off }
  const emit = (event: string, value?: unknown): void => {
    for (const listener of listeners.get(event) ?? []) listener(value)
  }

  return { sdk, listeners, emit, start, stop, isEnabled, off }
}

describe('browser feature flags', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates and starts one client-only SDK with public runtime configuration', async () => {
    const { sdk, start } = fakeSdk()
    const factory = vi.fn<BrowserFeatureFlagSdkFactory>().mockReturnValue(sdk)
    const flags = createBrowserFeatureFlags(config, factory)

    await Promise.all([flags.start(), flags.start()])

    expect(factory).toHaveBeenCalledOnce()
    expect(factory).toHaveBeenCalledWith({
      url: 'https://unleash.shapeandflow.de/api/frontend',
      clientKey: 'frontend-test-token',
      appName: 'shape-and-flow-landing-web',
      environment: 'development',
      context: { properties: { deployment: 'stage' } },
    })
    expect(start).toHaveBeenCalledOnce()
  })

  it('stays on the fallback until ready and reacts to SDK updates', async () => {
    const { sdk, emit, isEnabled } = fakeSdk()
    const flags = createBrowserFeatureFlags(config, () => sdk)
    await flags.start()

    expect(flags.isEnabled('landing.new-hero', false)).toBe(false)
    emit('ready')
    expect(flags.isEnabled('landing.new-hero', false)).toBe(true)
    expect(isEnabled).toHaveBeenCalledWith('landing.new-hero')
    const version = flags.version.value

    emit('update')
    expect(flags.version.value).toBe(version + 1)
  })

  it('keeps rendering when configuration, start, or evaluation fails', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const missing = createBrowserFeatureFlags({ ...config, frontendToken: '' }, vi.fn())
    await expect(missing.start()).resolves.toBeUndefined()
    expect(missing.isEnabled('landing.new-hero')).toBe(false)

    const { sdk, emit, start, isEnabled } = fakeSdk()
    start.mockRejectedValue(new Error('network down'))
    isEnabled.mockImplementation(() => {
      throw new Error('bad cache')
    })
    const failing = createBrowserFeatureFlags(config, () => sdk)
    await expect(failing.start()).resolves.toBeUndefined()
    emit('ready')
    expect(failing.isEnabled('landing.new-hero', true)).toBe(true)
    expect(warning).toHaveBeenCalledTimes(3)
  })

  it('detaches listeners and stops SDK timers on teardown', async () => {
    const { sdk, listeners, off, stop } = fakeSdk()
    const flags = createBrowserFeatureFlags(config, () => sdk)
    await flags.start()

    flags.stop()

    expect(off).toHaveBeenCalledTimes(3)
    expect([...listeners.values()].every(registered => registered.length === 0)).toBe(true)
    expect(stop).toHaveBeenCalledOnce()
  })

  it('exposes a reactive composable and defaults to false before readiness', () => {
    const { sdk, emit } = fakeSdk()
    const flags = createBrowserFeatureFlags(config, () => sdk)
    const provided = useNuxtApp().$featureFlags
    const original = { ...provided }
    Object.assign(provided, flags)
    const enabled = useFeatureFlag('landing.new-hero')

    expect(enabled.value).toBe(false)
    void flags.start().then(() => emit('ready'))
    emit('ready')
    expect(enabled.value).toBe(true)
    Object.assign(provided, original)
  })
})
