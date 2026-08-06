# Vor dem Livegang

Die Website ist vollständig gebaut, aber an einigen Stellen stehen noch Platzhalter, weil die
echten Angaben fehlten. Alle sind im Code mit `TODO` markiert:

```bash
grep -rn "TODO" shared/ app/ --include="*.ts" --include="*.vue"
```

## Blockierend: ohne diese Angaben nicht online gehen

### Kontaktdaten (`shared/site.ts`)

| Feld                     | Was hin muss                                                                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kontakt.telefon`        | Echte Nummer im Format `+49...`, ohne Leerzeichen. Landet in `tel:`-Links und im Structured Data.                                                                                                                               |
| `kontakt.telefonAnzeige` | Dieselbe Nummer lesbar formatiert, etwa `+49 231 1234567`.                                                                                                                                                                      |
| `kontakt.whatsapp`       | Nummer nur als Ziffern mit Ländervorwahl, etwa `4915112345678`. Ohne Plus und ohne Leerzeichen, sonst funktioniert der `wa.me`-Link nicht.                                                                                      |
| `kontakt.email`          | Echte Adresse. Aktuell steht `hallo@shapeandflow.de` als Annahme drin.                                                                                                                                                          |
| `kontakt.buchungUrl`     | Steht fest auf `https://booking.shapeandflow.de`. Der Server bedient bislang `buchung.shapeandflow.de` — dort muss also ein Vhost oder eine Weiterleitung für `booking.` her, sonst laufen alle Termin-Schaltflächen ins Leere. |
| `kontakt.instagram`      | Profiladresse oder auf `null` lassen.                                                                                                                                                                                           |

Diese Werte sind der Grund, warum die Seite noch nicht live gehen sollte: die
Terminschaltflächen stehen auf jeder Seite und führen derzeit ins Leere.

### Impressum (`app/pages/impressum.vue`)

Der Name der Inhaberin ist eingetragen und steht in `shared/site.ts`, damit die drei Stellen im
Impressum und in der Datenschutzerklärung nicht auseinanderlaufen.

Offen ist die **Umsatzsteuerangabe**: entweder die USt-IdNr. nach § 27 a UStG oder, bei
Kleinunternehmerregelung nach § 19 UStG, der entsprechende Hinweis. Ein Impressum mit
Platzhaltern ist abmahnbar.

### Datenschutzerklärung (`app/pages/datenschutz.vue`)

Erledigt: Name der Inhaberin, Standort des Servers (Deutschland) und Anbieter (Hostinger).

Wer die vollständige Firmierung der Vertragspartnerin ergänzen will, nimmt sie aus dem
Auftragsverarbeitungsvertrag. Art. 13 DSGVO verlangt an dieser Stelle den Empfänger, nicht dessen
Handelsregisteranschrift — die Angabe ist also kein Blocker.

## Nicht blockierend, aber empfohlen

- **Behandlungsdauer**: `dauerMinuten` in `shared/behandlungen.ts` steht auf `null`, die Angabe
  wird deshalb überall ausgeblendet. Sobald die Dauer feststeht, erscheint sie automatisch in der
  Preistabelle.
- **Öffnungszeiten**: Bewusst nicht erfunden. In `shared/site.ts` steht „Termine nach
  Vereinbarung", und das Structured Data enthält absichtlich keine `openingHoursSpecification`.
  Wenn es feste Zeiten gibt, gehören sie an beide Stellen.
- **Kundenstimmen**: Es stehen keine auf der Seite, weil erfundene Bewertungen sowohl rechtlich
  als auch bei Google ein Problem sind. Echte Stimmen nur mit schriftlicher Einwilligung.
- **OG-Image-Secret**: Für Deployments mit mehreren Instanzen oder rollierendem Neustart einmal
  `npx nuxt-og-image generate-secret` ausführen und das Ergebnis als `NUXT_OG_IMAGE_SECRET`
  setzen. Bei einer einzelnen VPS-Instanz nicht nötig.

## Nach dem Livegang

1. Google Search Console für `shapeandflow.de` einrichten und `https://shapeandflow.de/sitemap.xml`
   einreichen.
2. Google-Unternehmensprofil anlegen. Für ein lokales Studio bringt das mehr Sichtbarkeit als jede
   Änderung auf der Website. Name, Adresse und Telefonnummer müssen dort zeichengleich mit
   `shared/site.ts` übereinstimmen.
3. Prüfen, dass `stage.shapeandflow.de` und `dev.shapeandflow.de` nicht im Index landen. Beide
   stehen hinter Basic Auth und werden mit `NUXT_SITE_ENV=staging` gebaut, liefern also
   `Disallow: /`. Der Deploy prüft das bei jedem Lauf selbst (siehe `docs/deploy.md`); von Hand
   bestätigen lässt es sich nur mit den Basic-Auth-Zugangsdaten, sonst antwortet nginx mit 401:

   ```bash
   curl -fsS -u "$BASIC_AUTH_USER:$BASIC_AUTH_PASSWORD" \
     https://dev.shapeandflow.de/robots.txt | grep -Fx 'Disallow: /'
   ```

4. Structured Data stichprobenartig mit dem Rich-Results-Test von Google prüfen, insbesondere
   `/preise` (Angebote) und `/faq` (Fragen).
