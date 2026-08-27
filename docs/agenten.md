# Zugang für KI-Agenten

Die Seite beantwortet dieselben Inhalte für Menschen als HTML und für Maschinen als Markdown, und
sie sagt an sechs festen Adressen, was sie anbietet. Die Adressen sind nicht frei gewählt: Prüfwerkzeuge
und Agenten fragen genau dort nach. Wer die Seite in einem Browser mit WebMCP geöffnet hat, findet
darin zusätzlich Werkzeuge — siehe unten.

| Adresse                                | Was dort liegt                                        | Content-Type                          |
| -------------------------------------- | ----------------------------------------------------- | ------------------------------------- |
| `/.well-known/agent.md`                | Aufgaben, Grenzen und Kontaktpunkte, maschinenlesbar  | `text/markdown`                       |
| `/.well-known/api-catalog`             | Katalog der maschinenlesbaren Endpunkte nach RFC 9727 | `application/linkset+json` mit Profil |
| `/.well-known/ard.json`                | ARD-Manifest derselben Endpunkte für Registries       | `application/json`                    |
| `/.well-known/agent-skills/index.json` | Index der veröffentlichten Agent Skills, mit sha256   | `application/json`                    |
| `/.well-known/agent-skills/…/skill.md` | die Fähigkeit selbst im SKILL.md-Format               | `text/markdown`                       |
| `/auth.md`                             | Zugang für Agenten nach der Auth.md-Konvention        | `text/markdown`                       |
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

## WebMCP

Wer die Seite in einem Browser mit WebMCP geöffnet hat, muss das HTML nicht mehr lesen: die Seite
meldet beim Laden Werkzeuge an, und ein Agent bekommt die Antwort als Daten. Es ist der dritte Weg
zu denselben Inhalten, neben der Markdown-Fassung und den Endpunkten unter `/.well-known/`.

| Werkzeug              | Eingabe           | Was es beantwortet                                                 |
| --------------------- | ----------------- | ------------------------------------------------------------------ |
| `angebot_und_preise`  | keine             | Behandlungen, Kombitermin und Pakete mit Preis und Seite           |
| `faq_durchsuchen`     | `frage`, `thema?` | die häufigen Fragen im Wortlaut der Seite, bis zu drei             |
| `kontakt_und_anfahrt` | keine             | Anschrift, Gebäude, E-Mail, Formular, Karte, Terminhinweis         |
| `seite_oeffnen`       | `pfad`            | wechselt ohne Neuladen auf eine Seite dieser Website               |
| `seite_als_markdown`  | `pfad`            | dieselbe Darstellung wie `<Seite>.md`, ohne die Seite zu verlassen |

Die Werkzeuge antworten aus `shared/`, also aus denselben Listen, die Preistabelle, FAQ und
Structured Data speisen. Ein Preis steht an einer Stelle, und kein Werkzeug kann einen anderen
nennen als die Seite. Die Liste der Pfade kommt aus dem Router und nicht aus dieser Datei: eine neue
Seite ist mit dem nächsten Build Teil der Werkzeuge, eine gelöschte fällt heraus.

Alle Werkzeuge sind lesend (`readOnlyHint`), einzig `seite_oeffnen` ändert etwas — die angezeigte
Seite. Es gibt kein Werkzeug für das Kontaktformular und keines für einen Termin, aus demselben
Grund, aus dem `POST /api/kontakt` nicht im API-Katalog steht.

Die API hat sich noch nicht gesetzt, deshalb bedient `registerWebMcpTools` beide Formen, die im Feld
vorkommen: die Spezifikation legt `modelContext` auf das Dokument und registriert ein Werkzeug pro
Aufruf, der ältere Explainer und die Browser-Vorschau legen es auf den Navigator und nehmen den
ganzen Satz auf einmal. Wo ein Objekt beides anbietet, gewinnt `registerTool` — nur das lässt sich
über ein `AbortSignal` wieder zurücknehmen. Fehlt die API, passiert nichts, und die Seite arbeitet
wie vorher.

## Was bewusst fehlt

- **Keine Schreib-Schnittstelle.** `POST /api/kontakt` bedient das Formular dieser Seite, ist pro
  IP-Adresse ratenbegrenzt und steht deshalb nicht im API-Katalog. Die Agenten-Dokumentation sagt
  ausdrücklich, dass eine Anfrage über das Formular oder die E-Mail-Adresse gehört.
- **Keine Adresse der Buchungsstrecke.** Solange das Unleash-Flag `enable_booking_redirect` aus ist,
  zeigt nichts auf der Seite dorthin (`app/composables/useBuchung.ts`). Ein Dokument, das nicht unter
  dem Flag steht, würde diese Entscheidung aushebeln.
- **Keine OAuth-Metadaten.** Die Auth.md-Konvention sieht als bevorzugten Weg Protected Resource
  Metadata unter `/.well-known/oauth-protected-resource` und einen Authorization Server mit
  `agent_auth`-Block unter `/.well-known/oauth-authorization-server` vor. Hinter dieser Seite steht
  kein Authorization Server und vor ihr keine geschützte Ressource: jede Seite ist vorgerendert und
  öffentlich. Ein Dokument mit erfundenem Issuer und Endpunkten, die mit 404 antworten, wäre
  schlechter als keines — deshalb der von der Konvention vorgesehene Rückfallweg, ein
  selbsttragendes `/auth.md`. `test/agenten.spec.ts` prüft, dass beide Adressen 404 bleiben.
- **Kein Telefon, keine Öffnungszeiten** im Structured Data. Beides gibt es nicht, und eine erfundene
  Angabe wäre eine Falschaussage — siehe die Kommentare in `nuxt.config.ts`.

## Wo was liegt

```text
shared/agenten.ts                Die Pfade und die Regel <Seite> → <Seite>.md, einmal für alle
server/utils/agenten-texte.ts    Die Texte der Endpunkte, aus shared/ zusammengesetzt
server/routes/.well-known/       Die Handler, einer pro Adresse
server/routes/auth.md.ts         Der Handler für /auth.md, das laut Konvention im Wurzelverzeichnis liegt
server/plugins/agenten.ts        Link-Header und Content-Negotiation
server/utils/markdown-anfrage.ts Ist das eine Seite, und will sie Markdown?
server/utils/agenten-antwort.ts   GET und HEAD für die Endpunkte, Content-Type
modules/markdown/                Die Umwandlung HTML → Markdown im Build
app/utils/webmcp.ts              Die WebMCP-Werkzeuge und ihre Registrierung
app/plugins/webmcp.client.ts     Meldet sie beim Laden an, mit den Routen aus dem Router
test/agenten.spec.ts             Prüft alles davon am gebauten Artefakt
app/utils/webmcp.test.ts         Prüft die Werkzeuge und beide Formen der Registrierung
```

Die Endpunkte antworten zur Laufzeit und werden nicht vorgerendert
(`routeRules` in `nuxt.config.ts`). Der Grund ist der Content-Type: bei einer vorgerenderten Datei
leitet Nitro ihn aus der Dateiendung ab, und `/.well-known/api-catalog` hat keine — der Linkset
käme als `text/plain` heraus und verlöre sein Profil. Bei `/auth.md` gäbe die Endung den richtigen
Typ her, aber nicht das `charset=utf-8`, und das Dokument ist voller Umlaute.

Alle antworten auf `GET` und auf `HEAD`, alles andere bekommt 405. `HEAD` ist keine Zugabe:
RFC 9727 verlangt für `HEAD /.well-known/api-catalog` eine Antwort mit `Link`-Header und der
Relation `api-catalog`, und wer nur wissen will, ob ein Dokument existiert, schickt `HEAD`. Deshalb
tragen die Routendateien kein `.get` im Namen — Nitro leitet die Methode daraus ab, und ein
GET-Handler beantwortet `HEAD` mit 404. Die Prüfung der Methode steht in
`server/utils/agenten-antwort.ts` — dort steht auch `Access-Control-Allow-Origin: *`, das alle
Dokumente hier tragen: sie sind öffentlich und existieren, um von einem fremden Client geholt zu
werden. Ohne den Header bekommt ein Agent, der im Browser läuft, die Antwort und darf sie nicht
lesen.

Der Katalog ist ein Linkset nach RFC 9264, Abschnitt 4.2: ein Array von Link-Context-Objekten mit
`anchor` und je einem Member pro Relationstyp, dessen Wert eine Liste von Zielen ist. Die
Variante, die man im Feld häufiger sieht — eine Liste von `{ anchor, rel, href }`-Sätzen — ist
etwas anderes: ein konformer Client liest die Relation aus dem Member-Namen und findet darin keinen
einzigen Link.

Denselben Bestand gibt es zweimal, weil ihn zwei verschiedene Clients lesen: das Linkset nach
RFC 9727 ein Client, der schon vor der Tür steht und die Endpunkte will, und das ARD-Manifest unter
`/.well-known/ard.json` die Registries, die nach agentenfähigen Seiten crawlen und über die
`representativeQueries` jedes Eintrags Embeddings bilden (Agentic Resource Discovery, v0.91). Beide
werden aus `shared/agenten.ts` zusammengesetzt und können deshalb nicht auseinanderlaufen. Die
Kennungen im Manifest tragen den Host der Umgebung (`urn:air:<host>:<namespace>:<name>`), damit die
Stage-Seite nicht unter derselben URN landet wie die Produktion, und `application/json` steht
bewusst ohne `charset`: RFC 8259 kennt für diesen Medientyp keinen solchen Parameter, und ein
Prüfwerkzeug, das den Header wörtlich vergleicht, würde ihn sonst nicht wiedererkennen.

Die Adresse ist `/.well-known/ard.json` mit der Relation `ard`, nicht der Vorgänger
`/.well-known/ai-catalog.json` mit `ai-catalog`: ARD v0.91 verpflichtet Konsumenten nur auf das
neue Paar und stellt es ihnen frei, das alte überhaupt noch abzufragen. Ein Manifest, das an der
alten Adresse liegen bleibt, wird schlicht nicht mehr zwingend gefunden.

## Prüfen

```bash
npm test            # führt app/utils/webmcp.test.ts mit aus
npm run build
npm run test:a11y   # dieselbe Playwright-Konfiguration, führt test/agenten.spec.ts mit aus
```

`test/agenten.spec.ts` liest die vorgerenderten Seiten aus `.output/public` und verlangt für jede
eine Markdown-Fassung. Eine neue Seite ohne Markdown macht den Test rot, und ein Fehler in der
Umwandlung bricht schon den Build ab (`modules/markdown/index.ts` sammelt die Fehler und wirft am
Ende des Prerenders).

Die WebMCP-Werkzeuge prüft `app/utils/webmcp.test.ts` ohne Browser: die Namen gegen das, was die
Spezifikation zulässt, jede Antwort gegen `shared/`, und die Registrierung gegen beide Formen der
API. Ob eine echte Seite sie anmeldet, sagt ein Scan:

```bash
curl -s -X POST https://isitagentready.com/api/scan \
  -H 'content-type: application/json' \
  -d '{"url":"https://shapeandflow.de"}' | jq .checks.discovery.webMcp
```

Dasselbe für `/auth.md`, dessen Prüfung im Scan `authMd` heißt:

```bash
curl -s -X POST https://isitagentready.com/api/scan \
  -H 'content-type: application/json' \
  -d '{"url":"https://shapeandflow.de"}' | jq .checks.discovery.authMd
```
