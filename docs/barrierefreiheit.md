# Barrierefreiheit

Drei Stufen prüfen die Seite, und sie prüfen bewusst Verschiedenes.

| Stufe                               | Wo                                          | Was sie sieht                                                                                 | Was sie nicht sieht                                                                                                          |
| ----------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `eslint-plugin-vuejs-accessibility` | `npm run lint`                              | Quelltext: fehlendes `alt`, `<a>` ohne Ziel, Klick-Handler auf `<div>`, ungültige ARIA-Rollen | alles, was erst beim Rendern entsteht                                                                                        |
| `@nuxt/a11y`                        | Nuxt DevTools, nur im Dev-Modus             | axe-core auf dem laufenden DOM, während man entwickelt                                        | nichts automatisch — man muss hinschauen                                                                                     |
| axe in Chromium                     | Job _Barrierefreiheit_, `npm run test:a11y` | Kontrast, Sichtbarkeit, Fokusreihenfolge auf allen vorgerenderten Seiten                      | Dinge, die eine Maschine grundsätzlich nicht beurteilt: ob ein `alt`-Text den Inhalt trifft, ob die Reihenfolge sinnvoll ist |

Die letzte Stufe ist die teuerste und die einzige, die zählt, wenn es um Kontrast geht. Zur
Einordnung: eine Prüfung im simulierten DOM (linkedom oder jsdom, was der unveröffentlichte
Build-Zeit-Report von `@nuxt/a11y` täte) liefert über dieselben 13 Seiten **null Verstöße** — und
39 Regeln, die mangels Layout unentschieden bleiben. Darunter `color-contrast`,
`landmark-one-main` und `page-has-heading-one`. Ein grünes Ergebnis heißt dort nur, dass nichts
geprüft werden konnte.

## Was der erste Lauf fand

Bei seiner Einführung scheiterte der Job auf **allen 13 Seiten**, und zwar ausschließlich an
`color-contrast`. Struktur, ARIA, Beschriftungen, Landmarks und Überschriftenhierarchie waren
bereits sauber. Es waren drei Farbpaare:

| Vordergrund                | Hintergrund                      | War    | Gefordert (WCAG AA) | Wo                                        |
| -------------------------- | -------------------------------- | ------ | ------------------- | ----------------------------------------- |
| `#c2540a` (`--sf-primary`) | `#f5efe6` (`--sf-background`)    | 4.02:1 | 4.5:1               | Links im Fließtext, `.sf-eyebrow`         |
| `#c2540a`                  | `#ede4d6` (`--sf-surface-muted`) | 3.65:1 | 4.5:1               | `.sf-eyebrow` in abgesetzten Sektionen    |
| `#ebd0ba`                  | `#c2540a`                        | 3.12:1 | 4.5:1               | Unterzeile der Wortmarke im orangen Panel |

Bemerkenswert daran ist, wo der Fehler saß: der Kommentar in `tokens.css` erklärte die Wahl des
Orange ausdrücklich mit Kontrast — aber nur in einer Richtung. Weißer Text **auf** dem Orange
erreichte 4,6:1 und war bedacht. Das Orange **als** Text auf dem Beige war es nicht, und genau so
tritt es in Links, `.sf-eyebrow` und dem aktiven Navigationspunkt auf.

### Was geändert wurde

`--sf-primary` von `#c2540a` auf **`#a04607`**, `--sf-inverse-surface` mit — ein Panel in einem
anderen Orange als die Buttons darauf sähe nach Versehen aus. `--sf-primary-hover` musste
nachziehen, sonst wäre der Hover heller als der Ruhezustand geworden.

| Paarung                                  | Vorher | Nachher    |
| ---------------------------------------- | ------ | ---------- |
| Orange als Text auf `--sf-background`    | 4.02:1 | **5.45:1** |
| Orange als Text auf `--sf-surface-muted` | 3.65:1 | **4.94:1** |
| Weiß auf Orange (Button-Beschriftung)    | 4.60:1 | **6.22:1** |
| Creme auf Orange (Panel)                 | 4.02:1 | **5.45:1** |

### Der Fokusring musste mit

Das Abdunkeln hat an einer Stelle in die Gegenrichtung gewirkt. `--sf-focus-ring` war das
Fast-Schwarz `#16130f`, und WCAG 1.4.11 verlangt für einen Fokusindikator 3:1 gegen die
angrenzende Fläche — beim Primärbutton ist das genau das Orange. Auf `#c2540a` waren es 4,03:1,
auf `#a04607` nur noch **2,97:1**. Die Verbesserung für den Text war eine Verschlechterung für den
Ring.

Es gibt ein Fenster, in dem beides mit dem alten Ring aufgeht — `#a84908` bis `#a34608` —, aber
die Margen liegen dort zwischen 0,03 und 0,19. Statt darauf zu balancieren ist der Ring jetzt
reines Schwarz: 3,37:1 auf dem Orange, 18,37:1 auf dem Beige. Der Unterschied zwischen `#16130f`
und `#000000` ist im Betrieb nicht zu sehen, weil der Ring nur bei Tastaturfokus erscheint.

**Diese Regression hätte kein Test gefunden.** Ein Fokusindikator existiert nur im
`:focus-visible`-Zustand, und den nimmt ein Seitenscan nicht ein — die axe-Suite blieb grün.
Aufgefallen ist es an der Kontrast-Spec der Booking-App
(`booking-app/packages/ui/src/tokens.spec.ts`), die genau diese Paarung prüft. Wer die Farben
hier anfasst, rechnet sie mit.

Das dritte Paar war kein Token-Problem, sondern `opacity-80` an der Wortmarken-Unterzeile. Deckkraft
rechnet der Browser gegen den Untergrund, und das Ergebnis steht in keinem Token: Creme bei 80 %
über dem Orange ergibt `#e4cdb9` und damit 4,07:1 — auch mit dem neuen Orange zu wenig für 11px.
Die Klasse ist raus; die Zurücknahme leisten Sperrung und Schriftgrad.

Zwei Literale mussten mitgehen, weil sie keine CSS-Variable lesen können: `theme-color` in
`nuxt.config.ts` und `orange` in `app/components/OgImage/SfOg.takumi.vue` — der Takumi-Renderer
löst keine Custom Properties auf.

### Offen: das Nachbar-Repo

`--sf-primary` stammt laut README aus `booking-app/packages/ui/src/tokens.css`. Dort steht weiterhin
`#c2540a`. Solange das so ist, laufen die beiden Oberflächen in unterschiedlichem Orange — und die
Buchungs-App hat denselben Kontrastfehler, nur ungemessen.

## Prüfumfang

Der Test läuft gegen `wcag2a`, `wcag2aa`, `wcag21a` und `wcag21aa` — den Umfang, auf den sich BITV
und die EU-Richtlinie 2016/2102 beziehen. Die axe-Kategorie `best-practice` bleibt außen vor: das
sind Empfehlungen ohne Normbezug, und ein Gate soll nur erzwingen, worauf man sich berufen kann.

Die Routenliste kommt aus `.output/public`, nicht aus einer gepflegten Konstante. Eine neue Seite
unter `app/pages/` wird geprüft, ohne dass jemand daran denken muss.

## Lokal ausführen

```bash
npm run build      # der Test liest die Routen aus .output/public
npm run test:a11y
```
