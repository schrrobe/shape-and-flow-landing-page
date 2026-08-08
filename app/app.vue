<script setup lang="ts">
import { site } from '#shared/site'

useHead({
  titleTemplate: (title?: string | null) => (title ? `${title} | ${site.name}` : site.name),
})

// One WebSite node per page, so Google can reliably tie site name and language together.
useSchemaOrg([defineWebSite({ name: site.name, inLanguage: 'de-DE' }), defineWebPage()])
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
