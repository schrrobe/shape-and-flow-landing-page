import { serverFeatureFlags } from '../utils/feature-flags'

export default defineNitroPlugin(nitroApp => {
  const runtimeConfig = useRuntimeConfig()

  serverFeatureFlags.start(runtimeConfig.unleash)

  nitroApp.hooks.hook('close', () => {
    serverFeatureFlags.stop()
  })
})
