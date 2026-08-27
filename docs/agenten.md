# Zugang für KI-Agenten

Die Seite beantwortet dieselben Inhalte für Menschen als HTML und für Maschinen als Markdown, und
sie sagt an vier festen Adressen, was sie anbietet. Die Adressen sind nicht frei gewählt: Prüfwerkzeuge
und Agenten fragen genau dort nach.

| Adresse                                | Was dort liegt                                        | Content-Type                          |
| -------------------------------------- | ----------------------------------------------------- | ------------------------------------- |
| `/.well-known/agent.md`                | Aufgaben, Grenzen und Kontaktpunkte, maschinenlesbar  | `text/markdown`                       |
| `/.well-known/api-catalog`             | Katalog der maschinenlesbaren Endpunkte nach RFC 9727 | `application/linkset+json` mit Profil |
| `/.well-known/agent-skills/index.json` | Index der veröffentlichten Agent Skills, mit sha256   | `application/json`                    |
| `/.well-known/agent-skills/…/skill.md` | die Fähigkeit selbst im SKILL.md-Format               | `text/markdown`                       |
| `/llms.txt`                            | Hinweise für Sprachmodelle, erzeugt von `nuxt-llms`   | `text/plain`                          |
| `<Seite>.md`, Startseite `/.md`        | die Seite als Markdown                                | `text/markdown`                       |

Jede Seite nennt diese Adressen zweimal: als `<link rel>` im Head und als `Link`-Header. Ein Client,
der nur Header liest, bekommt dieselbe Antwort wie einer, der das HTML parst.

## Markdown

Die Markdown-Fassung ist keine zweite Quelle, sondern eine Darstellung der ausgelieferten Seite. Der
Build nimmt das fertige HTML, schneidet den Inhalt von `<main>` heraus und wandelt ihn um
(`modules/markdown/`, Turndown als devDependency). Damit gibt es nichts synchron zu halten: ein
geänderter Absatz ist mit dem nächsten Build auch im Markdown geändert, und eine Seite, die es nicht
gibt, hat auch kein Markdown.

Zwei Wege führen hin:

```bash
curl https://shapeandflow.de/preise.md
curl -H "Accept: text/markdown" https://shapeandflow.de/preise
```

Beide liefern dasselbe Dokument. Die Aushandlung sitzt in `server/plugins/agenten.ts` und
bewusst in den Hooks `request` und `beforeResponse` — nicht als Middleware: Nitro stellt den Handler
für die statischen Dateien vor jede Middleware, und alle Seiten sind vorgerendert. Eine Middleware
sähe eine Anfrage nach einer existierenden Seite nie.

Regeln der Umwandlung, jeweils mit einem Test in `modules/markdown/konvertierung.test.ts`:

- Kopf, Navigation und Fuß fallen weg, weil sie auf jeder Seite identisch sind
- die Preistabelle bleibt eine Tabelle (GFM)
- die eingeklappten FAQ-Fragen werden zu eigenen Zeilen
- Icons, dekorative Elemente (`aria-hidden`) und Formularfelder fallen weg, die Labels bleiben
- Front Matter mit Titel und Canonical der Seite, aus der Seite selbst gelesen

## Was bewusst fehlt

- **Keine Schreib-Schnittstelle.** `POST /api/kontakt` bedient das Formular dieser Seite, ist pro
  IP-Adresse ratenbegrenzt und steht deshalb nicht im API-Katalog. Die Agenten-Dokumentation sagt
  ausdrücklich, dass eine Anfrage über das Formular oder die E-Mail-Adresse gehört.
- **Keine Adresse der Buchungsstrecke.** Solange das Unleash-Flag `enable_booking_redirect` aus ist,
  zeigt nichts auf der Seite dorthin (`app/composables/useBuchung.ts`). Ein Dokument, das nicht unter
  dem Flag steht, würde diese Entscheidung aushebeln.
- **Kein Telefon, keine Öffnungszeiten** im Structured Data. Beides gibt es nicht, und eine erfundene
  Angabe wäre eine Falschaussage — siehe die Kommentare in `nuxt.config.ts`.

## Wo was liegt

```text
shared/agenten.ts                Die Pfade und die Regel <Seite> → <Seite>.md, einmal für alle
server/utils/agenten-texte.ts    Die Texte der vier Endpunkte, aus shared/ zusammengesetzt
server/routes/.well-known/       Die Handler, einer pro Adresse
server/plugins/agenten.ts        Link-Header und Content-Negotiation
server/utils/markdown-anfrage.ts Ist das eine Seite, und will sie Markdown?
server/utils/agenten-antwort.ts   GET und HEAD für die Endpunkte, Content-Type
modules/markdown/                Die Umwandlung HTML → Markdown im Build
test/agenten.spec.ts             Prüft alles davon am gebauten Artefakt
```

Die vier Endpunkte antworten zur Laufzeit und werden nicht vorgerendert
(`routeRules` in `nuxt.config.ts`). Der Grund ist der Content-Type: bei einer vorgerenderten Datei
leitet Nitro ihn aus der Dateiendung ab, und `/.well-known/api-catalog` hat keine — der Linkset
käme als `text/plain` heraus und verlöre sein Profil.

Alle vier antworten auf `GET` und auf `HEAD`, alles andere bekommt 405. `HEAD` ist keine Zugabe:
RFC 9727 verlangt für `HEAD /.well-known/api-catalog` eine Antwort mit `Link`-Header und der
Relation `api-catalog`, und wer nur wissen will, ob ein Dokument existiert, schickt `HEAD`. Deshalb
tragen die Routendateien kein `.get` im Namen — Nitro leitet die Methode daraus ab, und ein
GET-Handler beantwortet `HEAD` mit 404. Die Prüfung der Methode steht in
`server/utils/agenten-antwort.ts`.

Der Katalog ist ein Linkset nach RFC 9264, Abschnitt 4.2: ein Array von Link-Context-Objekten mit
`anchor` und je einem Member pro Relationstyp, dessen Wert eine Liste von Zielen ist. Die
Variante, die man im Feld häufiger sieht — eine Liste von `{ anchor, rel, href }`-Sätzen — ist
etwas anderes: ein konformer Client liest die Relation aus dem Member-Namen und findet darin keinen
einzigen Link.

## Prüfen

```bash
npm run build
npm run test:a11y   # dieselbe Playwright-Konfiguration, führt test/agenten.spec.ts mit aus
```

`test/agenten.spec.ts` liest die vorgerenderten Seiten aus `.output/public` und verlangt für jede
eine Markdown-Fassung. Eine neue Seite ohne Markdown macht den Test rot, und ein Fehler in der
Umwandlung bricht schon den Build ab (`modules/markdown/index.ts` sammelt die Fehler und wirft am
Ende des Prerenders).
