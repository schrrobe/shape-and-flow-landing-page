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

## Offener Punkt: Kontrast

Der Job ist deshalb `continue-on-error`. Er scheitert derzeit auf **allen 13 Seiten** — und zwar
ausschließlich an `color-contrast`. Struktur, ARIA, Beschriftungen, Landmarks und
Überschriftenhierarchie sind im echten Browser sauber. Es sind drei Farbpaare:

| Vordergrund                | Hintergrund                      | Ist    | Gefordert (WCAG AA) | Wo                                        |
| -------------------------- | -------------------------------- | ------ | ------------------- | ----------------------------------------- |
| `#c2540a` (`--sf-primary`) | `#f5efe6` (`--sf-surface`)       | 4.02:1 | 4.5:1               | Links im Fließtext, `.sf-eyebrow`         |
| `#c2540a`                  | `#ede4d6` (`--sf-surface-muted`) | 3.65:1 | 4.5:1               | `.sf-eyebrow` in abgesetzten Sektionen    |
| `#ebd0ba`                  | `#c2540a`                        | 3.12:1 | 4.5:1               | Unterzeile der Wortmarke im orangen Panel |

Die ersten beiden hängen an einem Wert: `--sf-primary` in `app/assets/css/tokens.css`. Ab
`#a84908` erreicht er beide Flächen (5.07:1 und 4.60:1) und bleibt dabei nah genug am Original.
Der Wert ist allerdings aus `booking-app/packages/ui/src/tokens.css` übernommen — eine Änderung
hier läuft aus dem Takt, solange sie dort nicht mitgeht.

Das dritte Paar ist kein Token-Problem: `#ebd0ba` entsteht aus cremeweißem Text mit `opacity-80`
über dem Orange. Ohne die Deckkraftreduktion wäre es `#f5efe6` auf `#c2540a` und damit 4.02:1 —
immer noch zu wenig, aber mit korrigiertem Primärton bei 5.07:1.

Wenn die Farben stehen, verschwindet `continue-on-error` aus dem Job in `.github/workflows/ci.yml`
und die Prüfung wird zum Gate.

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
