<script setup lang="ts">
import { artikelByRoute } from '#shared/ratgeber'
import { disclaimer } from '#shared/site'

/*
 * Ratgeberartikel zu einem Problem, nach dem gesucht wird, bevor jemand die Behandlung kennt.
 *
 * Der Artikel verkauft nicht, er erklärt. Der Verweis auf die Behandlung steht am Ende und nicht
 * in jedem zweiten Absatz: wer zuerst wissen will, warum die Beine abends dick sind, springt bei
 * einem Werbetext wieder ab.
 */
const artikel = artikelByRoute('/ratgeber/wassereinlagerungen')!

useSeite({
  titel: artikel.titel,
  kurzTitel: artikel.titel,
  ogTitel: 'Wassereinlagerungen im Körper',
  beschreibung:
    'Warum sich Wasser im Gewebe sammelt, was im Alltag hilft, wann Schwellungen ärztlich ' +
    'abgeklärt werden sollten und was eine Lymphdrainage dabei leisten kann.',
  ogLabel: 'Ratgeber',
  pfad: [{ name: 'Ratgeber', url: '/ratgeber' }],
})

useSchemaOrg([
  defineArticle({
    headline: artikel.titel,
    description:
      'Ursachen von Wassereinlagerungen, Maßnahmen im Alltag und die Grenze zur ärztlichen ' +
      'Abklärung.',
  }),
])
</script>

<template>
  <article>
    <SfSeitenkopf
      :titel="artikel.titel"
      label="Ratgeber"
      lead="Abends spannen die Beine, morgens ist das Gesicht verquollen. Meist ist das harmlos.
        Manchmal gehört es abgeklärt."
      :pfad="[{ name: 'Ratgeber', url: '/ratgeber' }]"
    />

    <div class="sf-container">
      <div class="sf-prose">
        <h2 class="mt-0!">Was im Körper passiert</h2>
        <p>
          Zwischen den Zellen liegt immer Flüssigkeit. Sie versorgt das Gewebe und wird über das
          Lymphsystem abtransportiert. Kommt weniger ab als nachkommt, sammelt sich Flüssigkeit im
          Gewebe. Das fühlt sich schwer und gespannt an, und man sieht es: der Ring sitzt enger, der
          Sockenrand zeichnet sich ab.
        </p>
        <p>
          Anders als Blut hat die Lymphe keine Pumpe. Sie bewegt sich vor allem, wenn Muskeln sich
          bewegen. Genau deshalb wird ein langer Sitztag im Gewebe spürbar.
        </p>

        <h2>Häufige Auslöser im Alltag</h2>
        <ul>
          <li>langes Sitzen oder Stehen ohne Wechsel der Haltung</li>
          <li>Hitze, weil sich die Gefäße weiten</li>
          <li>salzreiches Essen</li>
          <li>hormonelle Schwankungen im Zyklus</li>
          <li>zu wenig Bewegung über Tage hinweg</li>
          <li>Alkohol</li>
        </ul>
        <p>
          Dass abends mehr im Gewebe steht als morgens, ist normal. Auffällig wird es, wenn die
          Schwellung bleibt, wenn sie plötzlich kommt oder wenn sie nur eine Körperseite betrifft.
        </p>

        <h2>Was im Alltag hilft</h2>
        <p>
          Nichts davon ist spektakulär, aber es wirkt in dieselbe Richtung: Bewegung bringt die
          Lymphe in Gang. Ein Spaziergang nach dem Essen, die Treppe statt des Aufzugs,
          zwischendurch aufstehen. Beine hochlegen nutzt die Schwerkraft. Wer weniger salzig isst
          und ausreichend trinkt, nimmt dem Gewebe Arbeit ab. Dass zu wenig Trinken gegen
          Wassereinlagerungen hilft, ist ein verbreiteter Irrtum: der Körper hält Flüssigkeit dann
          eher zurück.
        </p>

        <h2>Wann Sie zur Ärztin oder zum Arzt gehen sollten</h2>
        <p>
          Wassereinlagerungen können ein Symptom sein, und dann gehören sie abgeklärt und nicht
          massiert. Lassen Sie ärztlich prüfen, wenn eines davon zutrifft:
        </p>
        <ul>
          <li>die Schwellung kommt plötzlich oder betrifft nur ein Bein</li>
          <li>die Stelle ist warm, rot oder schmerzt</li>
          <li>Atemnot oder Engegefühl in der Brust kommt hinzu</li>
          <li>die Schwellung bleibt über Tage bestehen</li>
          <li>Sie nehmen Medikamente, bei denen Wassereinlagerungen bekannt sind</li>
        </ul>
        <p>
          Das gilt besonders bei Verdacht auf eine Thrombose oder bei bekannten Herz-, Nieren- oder
          Lymphsystemerkrankungen. In diesen Fällen ist eine kosmetische Behandlung nicht die
          Antwort.
        </p>

        <h2>Was eine Lymphdrainage dabei leisten kann</h2>
        <p>
          Wenn medizinisch nichts dahintersteht, kann eine
          <NuxtLink to="/brasilianische-lymphdrainage">brasilianische Lymphdrainage</NuxtLink>
          den Körper dabei unterstützen, sich leichter und weniger gespannt anzufühlen, weil sie den
          Lymphfluss anregt. Sie behandelt die Ursache nicht: ein Sitztag bleibt ein Sitztag, und
          ein salziges Abendessen bleibt eines.
        </p>
        <p>
          Bei Shape &amp; Flow ist das der
          <NuxtLink to="/jeveauxeffect">Jeveauxeffect® für den Körper</NuxtLink>. Wie eine
          Behandlung abläuft und wann nicht behandelt wird, steht auf der Methodenseite.
        </p>
      </div>

      <SfHinweis class="mt-14 max-w-3xl">
        <p>
          Dieser Text ist allgemeine Information und keine medizinische Beratung. Bei Beschwerden
          oder Unsicherheiten wenden Sie sich an Ihre Ärztin oder Ihren Arzt.
        </p>
        <p>{{ disclaimer }}</p>
      </SfHinweis>

      <div class="mt-16">
        <SfCtaBlock inverse />
      </div>
    </div>
  </article>
</template>
