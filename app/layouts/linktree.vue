<script setup lang="ts">
import { trademarkNotice, site } from '#shared/site'

/*
 * The shell for /linktree, the only page without a header and without the large footer.
 *
 * It is opened from the social profiles on a phone, and there the site navigation is nothing but
 * a distraction: whoever arrives here is looking for exactly one of the buttons. No skip link,
 * because there is nothing to skip — the content starts right away.
 *
 * Impressum and Datenschutz stay regardless: both have to be one step away from every public
 * page. The trademark notice is here because the page names the Jeveauxeffect®.
 */
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-background">
    <main id="content" class="flex flex-1 flex-col items-center justify-center px-5 py-12 sm:py-16">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </main>

    <footer class="px-5 pb-10">
      <div class="mx-auto max-w-md space-y-4 text-center text-sm text-text-secondary">
        <ul class="flex flex-wrap justify-center gap-x-5 gap-y-2">
          <li>
            <NuxtLink to="/impressum" class="hover:text-primary hover:underline">
              Impressum
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/datenschutz" class="hover:text-primary hover:underline">
              Datenschutz
            </NuxtLink>
          </li>
          <!-- No year: a copyright year in the markup is wrong from January 1st onwards. -->
          <li>© {{ site.name }}</li>
        </ul>
        <p class="text-xs">{{ trademarkNotice }}</p>
      </div>
    </footer>
  </div>
</template>
