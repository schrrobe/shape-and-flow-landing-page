// Conventional Commits sind hier keine Kosmetik: release-please liest die Commit-Messages auf
// main, um Version und CHANGELOG zu bestimmen. Was das Format verfehlt, taucht im Release nicht auf.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    /*
     * subject-case verlangt Kleinschreibung am Satzanfang. Das ist eine Annahme über die
     * englische Sprache: hier stehen an dieser Stelle deutsche Substantive, und die schreibt
     * man groß. Die Regel würde jeden bisherigen Commit dieses Repositories verwerfen —
     * "feat: Deploy-Pipeline für prod, stage und dev" genauso wie
     * "fix: CodeRabbit-Anmerkungen aus PR #1".
     */
    'subject-case': [0],
  },
}
