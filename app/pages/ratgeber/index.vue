<script setup lang="ts">
import { ratgeber } from '#shared/ratgeber'

useSeite({
  titel: 'Ratgeber zu Lymphdrainage und Körpergefühl',
  ogTitel: 'Ratgeber',
  beschreibung:
    'Verständliche Texte zu Wassereinlagerungen und zum Unterschied zwischen ästhetischer und '
    + 'medizinischer Lymphdrainage. Ohne Heilversprechen.',
  ogLabel: 'Ratgeber',
})
</script>

<template>
  <div>
    <SfSeitenkopf
      titel="Ratgeber"
      label="Zum Nachlesen"
      lead="Hintergrund zu den Themen, mit denen Kundinnen zu uns kommen. Erklärend gemeint, nicht
        werbend."
    />

    <div class="sf-container">
      <ul class="grid max-w-4xl gap-6 sm:grid-cols-2">
        <li v-for="artikel in ratgeber" :key="artikel.route">
          <SfCard>
            <h2 class="font-display text-xl">
              <NuxtLink :to="artikel.route" class="hover:text-primary">
                {{ artikel.titel }}
              </NuxtLink>
            </h2>
            <p class="mt-3 text-text-secondary">
              {{ artikel.anriss }}
            </p>
            <NuxtLink
              :to="artikel.route"
              class="mt-4 inline-block text-primary underline underline-offset-4 hover:no-underline"
            >
              Weiterlesen
            </NuxtLink>
          </SfCard>
        </li>
      </ul>

      <div class="mt-16">
        <SfCtaBlock inverse />
      </div>
    </div>
  </div>
</template>
