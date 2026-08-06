<script setup lang="ts">
import { behandlungen, preis } from '#shared/behandlungen'
import { site } from '#shared/site'

/*
 * Die Preise als echte Tabelle.
 *
 * Eine Liste aus <div>s würde genauso aussehen, aber eine Tabelle sagt Screenreadern und
 * Suchmaschinen, dass Behandlung und Preis zusammengehören. Die Preise selbst stehen in
 * shared/behandlungen.ts und damit an derselben Stelle wie im Structured Data.
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
      <tr
        v-for="behandlung in behandlungen"
        :key="behandlung.slug"
        class="border-b border-border last:border-b-0"
      >
        <th scope="row" class="py-5 pr-4 align-top font-normal">
          <NuxtLink
            :to="behandlung.route"
            class="font-display text-xl text-text-primary underline decoration-1 underline-offset-4 hover:text-primary"
          >
            {{ behandlung.name }}
          </NuxtLink>
          <span class="mt-1 block text-sm text-text-secondary">
            {{ behandlung.titel }}
            <template v-if="behandlung.dauerMinuten">
              · {{ behandlung.dauerMinuten }} Minuten
            </template>
          </span>
        </th>
        <td class="py-5 text-right align-top font-display text-xl whitespace-nowrap">
          {{ preis(behandlung.preisEuro) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
