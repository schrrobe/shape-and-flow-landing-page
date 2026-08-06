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
npm run typecheck
```

## Stack

Nuxt 4 mit Tailwind CSS 4 (CSS-first, keine `tailwind.config.js`), `@nuxtjs/seo` für Sitemap,
robots.txt, Structured Data, OG-Bilder und Link-Prüfung, `@nuxt/image` für Bilder,
`@nuxt/fonts` für die selbst gehostete Schrift und `nuxt-llms` für `llms.txt`.

Gerendert wird hybrid: es läuft ein Node-Server, aber jede Seite wird beim Build vorgerendert. Siehe
[docs/deploy.md](docs/deploy.md).

## Branches

`fusion` deployt nach dev, `main` nach stage. Produktion bewegt sich erst, wenn die Release-PR von
release-please gemergt wird — Commits also im Conventional-Commits-Format schreiben, sonst taucht
die Änderung im CHANGELOG nicht auf. Einzelheiten in [docs/deploy.md](docs/deploy.md).

## Wo was liegt

```
shared/          Alle Geschäftsdaten: Kontakt, Behandlungen, Preise, FAQ, Ratgeber
app/pages/       Die 13 Seiten
app/components/  Sf*-Komponenten
app/composables/ useSeite() setzt Meta-Tags, OG-Bild und Brotkrümelpfad in einem Aufruf
app/assets/css/  tokens.css (die einzigen Farbwerte), theme.css (Tailwind-Anbindung), main.css
public/images/   Logo und Studiofotos
```

Inhalte ändern heißt in den meisten Fällen: eine Datei in `shared/` anfassen. Preise, FAQ-Einträge
und Kontaktdaten stehen dort jeweils genau einmal und wirken gleichzeitig auf die sichtbare Seite
und auf das Structured Data.

Die Farbwerte stammen unverändert aus der Booking-App (`booking-app/packages/ui/src/tokens.css` im
Repo `shape-and-flow`), damit Website und Buchungsstrecke dieselbe Marke zeigen. Wer dort etwas
ändert, sollte es hier mitziehen.

## Inhaltliche Regeln

Der Jeveauxeffect® ist eine ästhetische Behandlung im Beauty-Bereich, keine medizinische. Daraus
folgt für jeden Text auf dieser Website:

- keine Heilversprechen, keine Wirkungsgarantien
- Formulierungen wie "kann unterstützen" und "viele Kundinnen berichten" sind bewusst gewählt
- der Disclaimer aus `shared/site.ts` steht auf jeder Seite, die eine Wirkung beschreibt
- die Gegenanzeigen werden vollständig genannt, nicht ausschnittsweise
- "Jeveauxeffect®" und "Jeveauxeffect Face®" immer mit ®, dazu der Lizenzhinweis

## Vor dem Livegang

Es stehen noch Platzhalter im Code, vor allem Telefonnummer, WhatsApp-Nummer und die
Impressumsangaben. Die vollständige Liste steht in
[docs/launch-checklist.md](docs/launch-checklist.md):

```bash
grep -rn "TODO" shared/ app/ --include="*.ts" --include="*.vue"
```
