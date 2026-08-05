<script setup lang="ts">
import { site } from '#shared/site'

useHead({
  titleTemplate: (title?: string | null) => (title ? `${title} | ${site.name}` : site.name),
})

// Ein WebSite-Knoten pro Seite, damit Google Seitenname und Sprache sicher zuordnen kann.
useSchemaOrg([
  defineWebSite({ name: site.name, inLanguage: 'de-DE' }),
  defineWebPage(),
])
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
