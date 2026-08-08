<script setup lang="ts">
/*
 * The header of a sub-page: breadcrumb trail, label, heading, lead.
 *
 * The trail is visible here and not only in the structured data. Whoever lands in the middle of a
 * sub-page from a search query should see at a glance where they are.
 */
defineProps<{
  title: string
  lead?: string
  label?: string
  /** Intermediate steps without home and without the current page, same value as for usePage. */
  trail?: { name: string; url: string }[]
}>()
</script>

<template>
  <header class="sf-container pt-8 pb-10 sm:pt-12 sm:pb-14">
    <nav aria-label="Brotkrümelpfad" class="text-sm text-text-secondary">
      <ol class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <!--
          "Startseite" rather than "Start": a link text should still say where it leads when read
          on its own. Screen readers can list links separately, and there is no context next to
          them there.
        -->
        <li>
          <NuxtLink to="/" class="hover:text-primary hover:underline"> Startseite </NuxtLink>
        </li>
        <li v-for="step in trail" :key="step.url" class="flex items-center gap-x-2">
          <span aria-hidden="true" class="opacity-50">/</span>
          <NuxtLink :to="step.url" class="hover:text-primary hover:underline">
            {{ step.name }}
          </NuxtLink>
        </li>
        <li class="flex items-center gap-x-2">
          <span aria-hidden="true" class="opacity-50">/</span>
          <span aria-current="page" class="text-text-primary">{{ title }}</span>
        </li>
      </ol>
    </nav>

    <span v-if="label" class="sf-eyebrow mt-8">{{ label }}</span>
    <h1 class="mt-3 max-w-3xl text-3xl sm:text-4xl lg:text-5xl">
      {{ title }}
    </h1>
    <p v-if="lead" class="sf-lead mt-5 text-text-secondary">
      {{ lead }}
    </p>
  </header>
</template>
