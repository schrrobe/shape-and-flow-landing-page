<script setup lang="ts">
import { articles } from '#shared/ratgeber'

usePage({
  title: 'Ratgeber zu Lymphdrainage und Körpergefühl',
  ogTitle: 'Ratgeber',
  description:
    'Verständliche Texte zu Wassereinlagerungen und zum Unterschied zwischen ästhetischer und ' +
    'medizinischer Lymphdrainage. Ohne Heilversprechen.',
  ogLabel: 'Ratgeber',
})
</script>

<template>
  <div>
    <SfSeitenkopf
      title="Ratgeber"
      label="Zum Nachlesen"
      lead="Hintergrund zu den Themen, mit denen Kundinnen zu uns kommen. Erklärend gemeint, nicht
        werbend."
    />

    <div class="sf-container">
      <ul class="grid max-w-4xl gap-6 sm:grid-cols-2">
        <li v-for="article in articles" :key="article.route">
          <SfCard>
            <h2 class="font-display text-xl">
              <NuxtLink :to="article.route" class="hover:text-primary">
                {{ article.title }}
              </NuxtLink>
            </h2>
            <p class="mt-3 text-text-secondary">
              {{ article.teaser }}
            </p>
            <NuxtLink
              :to="article.route"
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
