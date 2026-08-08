// The base comes from .nuxt/eslint.config.mjs, which @nuxt/eslint regenerates on every
// `nuxt prepare`. It holds the rules for JS, TypeScript and Vue as well as the list of all
// auto-imports of this project. The file is therefore not checked in — without `npm ci` or
// `npx nuxt prepare`, `eslint .` fails with an import error.
import eslintConfigPrettier from 'eslint-config-prettier'
import vuejsAccessibility from 'eslint-plugin-vuejs-accessibility'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  /*
   * Accessibility, as far as it can be read off the source: an image without alt, an <a> without
   * a target, a click handler on a <div>, an ARIA role that does not exist. In the current state
   * the rule set finds nothing — it is here as a safety net for new pages.
   *
   * What cannot be read off the source it does not see either: contrast ratios, focus order,
   * whether an element ends up visible. For that, axe runs in the "Barrierefreiheit" job against
   * the fully rendered pages.
   */
  ...vuejsAccessibility.configs['flat/recommended'],
  {
    rules: {
      // On a statically prerendered page every console.* ends up in the visitor's browser.
      'no-console': 'error',

      /*
       * By default the rule demands both: the field *inside* the <label> plus a for/id pair. Here
       * one of the two is enough, and in the contact form that is the pair. Nesting is out of the
       * question there, because field and label sit above each other and a <label> around both
       * would also enclose the field's error message — whose text should not be read out on focus
       * but hang off aria-describedby.
       *
       * For the association the two are equivalent: WCAG 1.3.1 and 4.1.2 ask that the label is
       * programmatically attached to the field, not how.
       */
      'vuejs-accessibility/label-has-for': [
        'error',
        { required: { some: ['nesting', 'id'] }, allowChildren: false },
      ],

      /*
       * The rule dates from before the types. With `to?: string` the question mark already says
       * the prop may be absent, and in SfButton.vue that very absence is the condition by which
       * the component picks its element. A `to: undefined` default would add nothing there that
       * is not already stated.
       */
      'vue/require-default-prop': 'off',
    },
  },

  {
    // Under server/ the code runs in the Node process and not in the browser: there console.* is
    // the way into the container log and therefore the only place where a failed mail delivery
    // can be read at all. The reason for the ban above does not apply here.
    files: ['server/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  // Must come last: switches off every rule that would contradict Prettier.
  eslintConfigPrettier,
)
