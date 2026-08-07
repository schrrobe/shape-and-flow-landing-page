# shape-and-flow-landing-page

Website für **Shape & Flow**, Studio für brasilianische Lymphdrainage (Jeveauxeffect®) in der
Preinstraße 61, 44265 Dortmund. Deutschsprachig, auf lokale Suche und auf KI-Agenten ausgelegt.

Live unter `shapeandflow.de`. Vorschau unter `stage.shapeandflow.de` (was auf `main` liegt) und
`dev.shapeandflow.de` (was auf `fusion` liegt), beide hinter Basic Auth.

## Befehle

```bash
npm install
npm run dev        # Entwicklungsserver auf http://localhost:3000
npm run build      # Produktionsbuild, rendert alle Seiten vor
npm start          # den gebauten Server starten

npm run lint         # ESLint, keine Warnungen erlaubt
npm run lint:fix     # dasselbe mit --fix
npm run format       # Prettier schreibt
npm run format:check # Prettier prüft nur
npm run typecheck
npm run test:a11y    # axe in Chromium, braucht ein vorheriges npm run build
```

Lint, Formatcheck und Typecheck laufen bei jeder PR im Job _Prüfungen_. ESLint lädt seine Basis aus
`.nuxt/eslint.config.mjs`, das `nuxt prepare` erzeugt — nach einem frisch geklonten Repository
also erst `npm install` laufen lassen, sonst bricht `npm run lint` mit einem Import-Fehler ab.

Die Barrierefreiheitsprüfung hat einen eigenen Job, weil sie einen Browser braucht. Sie ist
blockierend und alle 13 Seiten sind sauber. Einzelheiten in
[docs/barrierefreiheit.md](docs/barrierefreiheit.md) — dort steht auch, warum `--sf-primary`
abgedunkelt wurde und was das für das `booking-app`-Repo bedeutet.

## Stack

Nuxt 4 mit Tailwind CSS 4 (CSS-first, keine `tailwind.config.js`), `@nuxtjs/seo` für Sitemap,
robots.txt, Structured Data, OG-Bilder und Link-Prüfung, `@nuxt/image` für Bilder,
`@nuxt/fonts` für die selbst gehostete Schrift und `nuxt-llms` für `llms.txt`.

Gerendert wird hybrid: es läuft ein Node-Server, aber jede Seite wird beim Build vorgerendert. Siehe
[docs/deploy.md](docs/deploy.md).

Feature-Flags kommen aus Unleash und werden aus demselben Grund **beim Build** ausgewertet
(`modules/unleash.ts`): umschalten heißt neu bauen. Ohne Zugangsdaten bleiben sie aus, der Build
läuft trotzdem. Lokal erzwingen: `NUXT_PUBLIC_FEATURES_BOOKING_REDIRECT=true npm run dev`.

## Branches

`fusion` deployt nach dev, `main` nach stage. Produktion bewegt sich erst, wenn die Release-PR von
release-please gemergt wird — Commits also im Conventional-Commits-Format schreiben, sonst taucht
die Änderung im CHANGELOG nicht auf. commitlint prüft in der PR sowohl die Commits als auch den
Titel, weil beim Squash-Merge der Titel zur Commit-Message wird. Einzelheiten in
[docs/deploy.md](docs/deploy.md).

## Wo was liegt

```
shared/          Alle Geschäftsdaten: Kontakt, Behandlungen, Preise, FAQ, Ratgeber
app/pages/       Die 13 Seiten
app/components/  Sf*-Komponenten
app/composables/ useSeite() setzt Meta-Tags, OG-Bild und Brotkrümelpfad in einem Aufruf
modules/         unleash.ts liest die Feature-Flags beim Build
app/assets/css/  tokens.css (die einzigen Farbwerte), theme.css (Tailwind-Anbindung), main.css
public/images/   Logo und Studiofotos
```

Inhalte ändern heißt in den meisten Fällen: eine Datei in `shared/` anfassen. Preise, FAQ-Einträge
und Kontaktdaten stehen dort jeweils genau einmal und wirken gleichzeitig auf die sichtbare Seite
und auf das Structured Data.

Die Farbwerte stammen aus der Booking-App (`booking-app/packages/ui/src/tokens.css` im Repo
`shape-and-flow`), damit Website und Buchungsstrecke dieselbe Marke zeigen. Wer dort etwas ändert,
sollte es hier mitziehen.

**Eine Abweichung gibt es derzeit.** `--sf-primary` steht hier auf `#a04607` statt `#c2540a`, weil
das ursprüngliche Orange als Textfarbe auf dem Beige die WCAG-AA-Schwelle von 4,5:1 verfehlt —
gemessen, nicht geschätzt, siehe [docs/barrierefreiheit.md](docs/barrierefreiheit.md). Mitbewegt
haben sich `--sf-primary-hover` und `--sf-inverse-surface`. Die Booking-App hat denselben Fehler
und sollte nachziehen; bis dahin zeigen die beiden Oberflächen unterschiedliche Orangetöne.

## Inhaltliche Regeln

Der Jeveauxeffect® ist eine ästhetische Behandlung im Beauty-Bereich, keine medizinische. Daraus
folgt für jeden Text auf dieser Website:

- keine Heilversprechen, keine Wirkungsgarantien
- Formulierungen wie "kann unterstützen" und "viele Kundinnen berichten" sind bewusst gewählt
- der Disclaimer aus `shared/site.ts` steht auf jeder Seite, die eine Wirkung beschreibt
- die Gegenanzeigen werden vollständig genannt, nicht ausschnittsweise
- "Jeveauxeffect®" und "Jeveauxeffect Face®" immer mit ®, dazu der Lizenzhinweis

## Vor dem Livegang

Es stehen noch Platzhalter im Code, vor allem die E-Mail-Adresse, und die Zugangsdaten des
Postausgangsservers für das Kontaktformular fehlen. Die vollständige Liste steht in
[docs/launch-checklist.md](docs/launch-checklist.md):

```bash
grep -rn "TODO" shared/ app/ --include="*.ts" --include="*.vue"
```
