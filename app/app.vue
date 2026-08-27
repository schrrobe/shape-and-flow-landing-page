<script setup lang="ts">
import type { Link } from '@unhead/vue'
import { discoveryLinks } from '#shared/agenten'
import { site } from '#shared/site'

const route = useRoute()

/*
 * As a computed value and not as a plain call: after a client-side page change the head is
 * rebuilt, and a fixed list would then point at the Markdown of the previous page.
 *
 * The cast is needed because unhead only types the registered link relations, and three of the
 * six — api-catalog, ard and agent-skills — are not among them. rel is an extensible
 * token list, so they are allowed; only the type does not know them.
 */
const agentLinks = computed(() => discoveryLinks(route.path) as Link[])

useHead({
  titleTemplate: (title?: string | null) => (title ? `${title} | ${site.name}` : site.name),
  /*
   * Where an agent finds the Markdown representation of this page, the agent documentation, the
   * API catalogue, the ARD manifest, the Agent Skills index and llms.txt.
   *
   * The same list is sent as a Link header by server/plugins/agenten.ts. Here in the markup as
   * well, because whoever reads a saved page or only parses the HTML has no headers — and it is
   * the home page that gets looked at for these links.
   *
   * Relative paths: the canonical says which host the page belongs to, and a link element is
   * resolved against the document.
   */
  link: agentLinks,
})

// One WebSite node per page, so Google can reliably tie site name and language together.
useSchemaOrg([defineWebSite({ name: site.name, inLanguage: 'de-DE' }), defineWebPage()])
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
