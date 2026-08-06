<script setup lang="ts">
/*
 * Der Ablauf der Behandlung als Sequenz.
 *
 * Die Nummerierung steht hier, weil der Ablauf tatsächlich eine feste Reihenfolge hat: erst wird
 * die Lymphe aktiviert, dann wird modelliert. Die Reihenfolge ist die Methode, nicht Dekoration.
 *
 * Durch die Marker läuft eine durchgehende Linie. Das ist die Konturlinie aus dem Logo, hier als
 * Verbindung zwischen den Phasen: eine Linie, ein Weg, eine Richtung. Sie ist das einzige
 * dekorative Element der Seite und kommt genau an dieser Stelle vor.
 */
defineProps<{
  phasen: { titel: string; text: string }[]
}>()
</script>

<template>
  <ol class="sf-ablauf relative">
    <li v-for="(phase, i) in phasen" :key="phase.titel" class="relative pb-10 pl-16 last:pb-0">
      <!--
        Die Linie sitzt am li und endet beim letzten Element, damit sie nicht ins Leere läuft.
        Als Pseudoelement per CSS, weil ein SVG pro Schritt nur mehr Markup für dasselbe Bild wäre.
      -->
      <span class="sf-ablauf-marker font-display" aria-hidden="true">{{ i + 1 }}</span>
      <h3 class="text-xl">
        {{ phase.titel }}
      </h3>
      <p class="mt-2 text-text-secondary">
        {{ phase.text }}
      </p>
    </li>
  </ol>
</template>

<style scoped>
.sf-ablauf-marker {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  width: 2.75rem;
  height: 2.75rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--sf-border);
  border-radius: 9999px;
  background-color: var(--sf-surface);
  color: var(--sf-primary);
  font-size: 1.125rem;
  line-height: 1;
}

/* Die verbindende Linie: von der Unterkante eines Markers zur Oberkante des nächsten. */
.sf-ablauf li:not(:last-child)::before {
  content: '';
  position: absolute;
  top: 2.75rem;
  bottom: 0;
  left: calc(1.375rem - 1px);
  width: 2px;
  background: linear-gradient(
    to bottom,
    var(--sf-primary) 0%,
    color-mix(in srgb, var(--sf-primary) 35%, transparent) 100%
  );
}

/*
 * Die Linie zeichnet sich beim Scrollen. Läuft ohne JavaScript über eine View-Timeline; wo der
 * Browser die nicht kennt, ist die Linie einfach von Anfang an da.
 */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .sf-ablauf li:not(:last-child)::before {
      animation: sf-draw linear both;
      animation-timeline: view();
      animation-range: entry 15% cover 40%;
      transform-origin: top;
    }
  }
}

@keyframes sf-draw {
  from {
    transform: scaleY(0);
  }

  to {
    transform: scaleY(1);
  }
}
</style>
