<script setup lang="ts">
import { markenhinweis, site } from '#shared/site'

/*
 * Die Hülle für /linktree, die einzige Seite ohne Kopfzeile und ohne großen Fuß.
 *
 * Sie wird aus den Social-Profilen heraus auf dem Telefon geöffnet, und dort ist die Navigation
 * der Website nur Ablenkung: wer hierher kommt, sucht genau einen der Knöpfe. Kein Sprunglink,
 * weil es nichts zu überspringen gibt — der Inhalt beginnt sofort.
 *
 * Impressum und Datenschutz bleiben trotzdem stehen: beide müssen von jeder öffentlichen Seite
 * aus in einem Schritt erreichbar sein. Der Markenhinweis steht hier, weil die Seite den
 * Jeveauxeffect® nennt.
 */
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-background">
    <main id="inhalt" class="flex flex-1 flex-col items-center justify-center px-5 py-12 sm:py-16">
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
          <!-- Ohne Jahreszahl: ein Copyright-Jahr im Markup ist ab dem 1. Januar falsch. -->
          <li>© {{ site.name }}</li>
        </ul>
        <p class="text-xs">{{ markenhinweis }}</p>
      </div>
    </footer>
  </div>
</template>
