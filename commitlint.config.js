// Conventional Commits are not cosmetics here: release-please reads the commit messages on main
// to determine version and CHANGELOG. Anything missing the format does not show up in the release.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    /*
     * subject-case demands lower case at the start of the sentence. That is an assumption about
     * English: what stands in that position here are German nouns, and those are capitalised. The
     * rule would reject every commit this repository has so far —
     * "feat: Deploy-Pipeline für prod, stage und dev" just like
     * "fix: CodeRabbit-Anmerkungen aus PR #1".
     */
    'subject-case': [0],
  },
}
