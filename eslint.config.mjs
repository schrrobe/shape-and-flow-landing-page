// Die Basis kommt aus .nuxt/eslint.config.mjs, das @nuxt/eslint bei jedem `nuxt prepare` neu
// erzeugt. Darin stecken die Regeln für JS, TypeScript und Vue sowie die Liste aller
// Auto-Imports dieses Projekts. Die Datei ist deshalb nicht eingecheckt — ohne `npm ci` oder
// `npx nuxt prepare` schlägt `eslint .` mit einem Import-Fehler fehl.
import eslintConfigPrettier from 'eslint-config-prettier'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      // Auf einer statisch vorgerenderten Seite landet jedes console.* im Browser des Besuchers.
      'no-console': 'error',

      /*
       * Die Regel stammt aus der Zeit vor den Typen. Bei `to?: string` sagt das Fragezeichen
       * bereits, dass die Prop fehlen darf, und in SfButton.vue ist genau dieses Fehlen die
       * Bedingung, an der die Komponente ihr Element wählt. Ein `to: undefined` als Default
       * würde dort nichts ergänzen, was nicht schon dasteht.
       */
      'vue/require-default-prop': 'off',
    },
  },
  // Muss zuletzt stehen: schaltet alle Regeln ab, die Prettier widersprechen würden.
  eslintConfigPrettier,
)
