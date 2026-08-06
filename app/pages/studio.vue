<script setup lang="ts">
import { adresse, kartenUrl, markenhinweis, oeffnungszeiten, site } from '#shared/site'

useSeite({
  titel: `Studio in ${adresse.ort}`,
  kurzTitel: 'Das Studio',
  beschreibung:
    `Shape & Flow ist ein kleines Studio für brasilianische Lymphdrainage in ${adresse.strasse}, ` +
    `${adresse.plz} ${adresse.ort}. Ein Behandlungsraum, Termine nach Vereinbarung.`,
  ogLabel: 'Das Studio',
})
</script>

<template>
  <article>
    <SfSeitenkopf
      titel="Das Studio"
      :label="site.nameAscii"
      :lead="`Ein Raum in ${adresse.stadtteil}, eine Behandlung zur Zeit. Kein Großbetrieb, keine
        Parallelbetreuung.`"
    />

    <div class="sf-container">
      <div class="grid gap-8 sm:grid-cols-2">
        <NuxtImg
          src="/images/studio-1.jpg"
          alt="Behandlungsraum bei Shape and Flow: Massageliege mit orangefarbenem Plaid vor der orangefarbenen Wand mit Jeveaux-Postern"
          class="aspect-4/5 w-full rounded-sf border border-border object-cover shadow-card"
          width="1301"
          height="1626"
          sizes="100vw sm:46vw"
        />
        <NuxtImg
          src="/images/studio-2.jpg"
          alt="Umkleideecke im Studio mit Rattan-Paravent, Rattansessel mit orangefarbenem Kissen und kleinem Beistelltisch"
          class="aspect-4/5 w-full rounded-sf border border-border object-cover shadow-card"
          width="1536"
          height="2048"
          sizes="100vw sm:46vw"
          loading="lazy"
        />
      </div>

      <div class="mt-14 grid gap-14 lg:grid-cols-[1fr_20rem] lg:gap-20">
        <div class="sf-prose">
          <h2>Wie hier gearbeitet wird</h2>
          <p>
            {{ site.name }} ist ein kleines Studio in {{ adresse.stadtteil }}. Es gibt einen
            Behandlungsraum, und in dem sind während Ihres Termins nur Sie. Neben dem
            Behandlungsraum gibt es eine Ecke zum Umziehen und Ankommen.
          </p>
          <p>
            Behandelt wird nach Termin, nicht mit offener Tür. Das hat einen praktischen Grund: der
            Jeveauxeffect® hat einen festen Ablauf, der sich nicht sinnvoll unterbrechen lässt.
          </p>

          <h2>Vor der ersten Behandlung</h2>
          <p>
            Beim ersten Termin nehmen wir uns vorab Zeit für ein Gespräch: was Sie sich vorstellen,
            worauf wir gesundheitlich achten müssen und wie kräftig gearbeitet wird. Kommen Sie in
            bequemer Kleidung und planen Sie etwas Puffer ein.
          </p>

          <h2>Lizenzierter Partner</h2>
          <p>
            {{ site.name }} arbeitet als lizenzierter Partner der Jeveaux Company® mit dem
            Jeveauxeffect® und dem Jeveauxeffect Face®. Die Methode wird nicht nachempfunden,
            sondern so ausgeführt, wie die Jeveaux Company® sie entwickelt und geschult hat.
          </p>

          <h2>Anfahrt</h2>
          <p>
            Das Studio liegt in der {{ adresse.strasse }} in {{ adresse.plz }} {{ adresse.ort }}, im
            Süden der Stadt. Die genaue Wegbeschreibung und die Kontaktwege stehen auf der
            <NuxtLink to="/kontakt">Kontaktseite</NuxtLink>.
          </p>
        </div>

        <aside class="lg:sticky lg:top-28 lg:self-start">
          <SfCard>
            <h2 class="sf-eyebrow">Studio</h2>
            <address class="mt-4 space-y-3 text-sm not-italic">
              <p>
                <span class="font-medium">{{ site.name }}</span
                ><br />
                {{ adresse.strasse }}<br />
                {{ adresse.plz }} {{ adresse.ort }}
              </p>
              <p class="text-text-secondary">
                {{ oeffnungszeiten.hinweis }}
              </p>
            </address>
            <div class="mt-5 flex flex-col gap-3">
              <SfButton to="/kontakt"> Kontakt und Anfahrt </SfButton>
              <SfButton :href="kartenUrl" variant="secondary" external>
                In Google Maps ansehen
              </SfButton>
            </div>
            <SfRule class="my-5 text-border" />
            <p class="text-sm text-text-secondary">
              {{ markenhinweis }}
            </p>
          </SfCard>
        </aside>
      </div>

      <div class="mt-16">
        <SfCtaBlock inverse />
      </div>
    </div>
  </article>
</template>
