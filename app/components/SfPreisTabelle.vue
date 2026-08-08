<script setup lang="ts">
import { treatments, formatPrice, priceItems } from '#shared/behandlungen'
import { site } from '#shared/site'

/*
 * The prices as a real table.
 *
 * A list of <div>s would look the same, but a table tells screen readers and search engines that
 * treatment and price belong together. The prices themselves live in shared/behandlungen.ts and
 * therefore in the same place as in the structured data.
 *
 * Two groups in one table: the individual treatments with a link to their page, below them the
 * combo appointment and the packages, which have no pages of their own.
 */
</script>

<template>
  <table class="w-full border-collapse text-left">
    <caption class="sr-only">
      Behandlungen und Preise bei
      {{
        site.nameAscii
      }}
    </caption>
    <thead>
      <tr class="border-b border-border">
        <th
          scope="col"
          class="pb-3 text-sm font-medium tracking-wide text-text-secondary uppercase"
        >
          Behandlung
        </th>
        <th
          scope="col"
          class="pb-3 text-right text-sm font-medium tracking-wide text-text-secondary uppercase"
        >
          Preis
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="treatment in treatments" :key="treatment.slug" class="border-b border-border">
        <th scope="row" class="py-5 pr-4 align-top font-normal">
          <NuxtLink
            :to="treatment.route"
            class="font-display text-xl text-text-primary underline decoration-1 underline-offset-4 hover:text-primary"
          >
            {{ treatment.name }}
          </NuxtLink>
          <span class="mt-1 block text-sm text-text-secondary">
            {{ treatment.title }}
            <template v-if="treatment.durationMinutes">
              · {{ treatment.durationMinutes }} Minuten
            </template>
          </span>
        </th>
        <td class="py-5 text-right align-top font-display text-xl whitespace-nowrap">
          {{ formatPrice(treatment.priceEuro) }}
        </td>
      </tr>
    </tbody>
    <tbody>
      <tr class="border-b border-border">
        <th
          id="kombitermin"
          scope="colgroup"
          colspan="2"
          class="scroll-mt-28 pt-12 pb-3 text-sm font-medium tracking-wide text-text-secondary uppercase"
        >
          Kombitermin und Pakete
        </th>
      </tr>
      <tr
        v-for="item in priceItems"
        :key="item.slug"
        class="border-b border-border last:border-b-0"
      >
        <th scope="row" class="py-5 pr-4 align-top font-normal">
          <span class="font-display text-xl text-text-primary">{{ item.name }}</span>
          <span class="mt-1 block text-sm text-text-secondary">{{ item.note }}</span>
        </th>
        <td class="py-5 text-right align-top font-display text-xl whitespace-nowrap">
          {{ formatPrice(item.priceEuro) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
