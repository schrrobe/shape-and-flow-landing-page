// Conventional Commits sind hier keine Kosmetik: release-please liest die Commit-Messages auf
// main, um Version und CHANGELOG zu bestimmen. Was das Format verfehlt, taucht im Release nicht auf.
export default {
  extends: ['@commitlint/config-conventional'],
}
