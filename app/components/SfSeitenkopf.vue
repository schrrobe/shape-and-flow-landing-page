<script setup lang="ts">
/*
 * Der Kopf einer Unterseite: Brotkrümelpfad, Label, Überschrift, Anreißer.
 *
 * Der Pfad ist hier sichtbar und nicht nur im Structured Data. Wer über eine Suchanfrage mitten
 * auf einer Unterseite landet, soll auf den ersten Blick sehen, wo er ist.
 */
defineProps<{
  titel: string
  lead?: string
  label?: string
  /** Zwischenstufen ohne Start und ohne die aktuelle Seite, gleiche Angabe wie bei useSeite. */
  pfad?: { name: string, url: string }[]
}>()
</script>

<template>
  <header class="sf-container pt-8 pb-10 sm:pt-12 sm:pb-14">
    <nav aria-label="Brotkrümelpfad" class="text-sm text-text-secondary">
      <ol class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <!--
          "Startseite" statt "Start": ein Linktext soll auch allein gelesen noch sagen, wohin er
          führt. Screenreader lassen sich Links als Liste ausgeben, und dort steht dann kein Kontext
          daneben.
        -->
        <li>
          <NuxtLink to="/" class="hover:text-primary hover:underline">
            Startseite
          </NuxtLink>
        </li>
        <li v-for="stufe in pfad" :key="stufe.url" class="flex items-center gap-x-2">
          <span aria-hidden="true" class="opacity-50">/</span>
          <NuxtLink :to="stufe.url" class="hover:text-primary hover:underline">
            {{ stufe.name }}
          </NuxtLink>
        </li>
        <li class="flex items-center gap-x-2">
          <span aria-hidden="true" class="opacity-50">/</span>
          <span aria-current="page" class="text-text-primary">{{ titel }}</span>
        </li>
      </ol>
    </nav>

    <span v-if="label" class="sf-eyebrow mt-8">{{ label }}</span>
    <h1 class="mt-3 max-w-3xl text-3xl sm:text-4xl lg:text-5xl">
      {{ titel }}
    </h1>
    <p v-if="lead" class="sf-lead mt-5 text-text-secondary">
      {{ lead }}
    </p>
  </header>
</template>
