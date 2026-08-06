// Die Basis kommt aus .nuxt/eslint.config.mjs, das @nuxt/eslint bei jedem `nuxt prepare` neu
// erzeugt. Darin stecken die Regeln für JS, TypeScript und Vue sowie die Liste aller
// Auto-Imports dieses Projekts. Die Datei ist deshalb nicht eingecheckt — ohne `npm ci` oder
// `npx nuxt prepare` schlägt `eslint .` mit einem Import-Fehler fehl.
import eslintConfigPrettier from 'eslint-config-prettier'
import vuejsAccessibility from 'eslint-plugin-vuejs-accessibility'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  /*
   * Barrierefreiheit, soweit sie am Quelltext ablesbar ist: ein Bild ohne alt, ein <a> ohne
   * Ziel, ein Klick-Handler auf einem <div>, eine ARIA-Rolle, die es nicht gibt. Das Regelwerk
   * findet im aktuellen Stand nichts — es steht hier als Rückfallsicherung für neue Seiten.
   *
   * Was am Quelltext nicht ablesbar ist, sieht es auch nicht: Kontrastverhältnisse,
   * Fokusreihenfolge, ob ein Element am Ende sichtbar ist. Dafür läuft axe im Job
   * "Barrierefreiheit" gegen die fertig gerenderten Seiten.
   */
  ...vuejsAccessibility.configs['flat/recommended'],
  {
    rules: {
      // Auf einer statisch vorgerenderten Seite landet jedes console.* im Browser des Besuchers.
      'no-console': 'error',

      /*
       * Standardmäßig verlangt die Regel beides: das Feld *im* <label> und dazu ein for/id-Paar.
       * Hier genügt eines von beiden, und im Kontaktformular ist das das Paar. Die Verschachtelung
       * scheidet dort aus, weil Feld und Beschriftung untereinander stehen und ein <label> um
       * beides herum auch die Fehlermeldung des Feldes einschließen würde — deren Text soll nicht
       * beim Fokus mit vorgelesen werden, sondern über aria-describedby hängen.
       *
       * Für die Zuordnung ist das gleichwertig: WCAG 1.3.1 und 4.1.2 fragen danach, dass die
       * Beschriftung programmatisch am Feld hängt, nicht wie.
       */
      'vuejs-accessibility/label-has-for': [
        'error',
        { required: { some: ['nesting', 'id'] }, allowChildren: false },
      ],

      /*
       * Die Regel stammt aus der Zeit vor den Typen. Bei `to?: string` sagt das Fragezeichen
       * bereits, dass die Prop fehlen darf, und in SfButton.vue ist genau dieses Fehlen die
       * Bedingung, an der die Komponente ihr Element wählt. Ein `to: undefined` als Default
       * würde dort nichts ergänzen, was nicht schon dasteht.
       */
      'vue/require-default-prop': 'off',
    },
  },

  {
    // Unter server/ läuft der Code im Node-Prozess und nicht im Browser: dort ist console.* der
    // Weg ins Containerlog und damit die einzige Stelle, an der ein fehlgeschlagener Mailversand
    // überhaupt nachlesbar ist. Der Grund für das Verbot oben gilt hier also nicht.
    files: ['server/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  // Muss zuletzt stehen: schaltet alle Regeln ab, die Prettier widersprechen würden.
  eslintConfigPrettier,
)
