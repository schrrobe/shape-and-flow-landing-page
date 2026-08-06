# Vor dem Livegang

Die Website ist vollständig gebaut, aber an einigen Stellen stehen noch Platzhalter, weil die
echten Angaben fehlten. Alle sind im Code mit `TODO` markiert:

```bash
grep -rn "TODO" shared/ app/ --include="*.ts" --include="*.vue"
```

## Blockierend: ohne diese Angaben nicht online gehen

### Kontaktdaten (`shared/site.ts`)

| Feld                 | Was hin muss                                                                                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kontakt.email`      | Echte Adresse. Aktuell steht `hallo@shapeandflow.de` als Annahme drin. Sie steht im Impressum, in der Datenschutzerklärung, im Structured Data und ist das Ziel des Kontaktformulars.                                           |
| `kontakt.buchungUrl` | Steht fest auf `https://booking.shapeandflow.de`. Der Server bedient bislang `buchung.shapeandflow.de` — dort muss also ein Vhost oder eine Weiterleitung für `booking.` her, sonst laufen alle Termin-Schaltflächen ins Leere. |
| `kontakt.instagram`  | Profiladresse oder auf `null` lassen.                                                                                                                                                                                           |

Diese Werte sind der Grund, warum die Seite noch nicht live gehen sollte: die
Terminschaltflächen stehen auf jeder Seite und führen derzeit ins Leere.

### Postausgangsserver für das Kontaktformular

Das Formular auf `/kontakt` schickt an `server/api/kontakt.post.ts`, und die Route stellt die
Anfrage per SMTP zu. Ohne Zugangsdaten antwortet sie mit 503, das Formular nennt dann die
E-Mail-Adresse — es geht also keine Anfrage verloren, aber der Weg über das Formular ist zu.

Die Werte gehören ins GitHub-Environment der jeweiligen Umgebung, nicht ins Repository. Der
Deploy schreibt sie von dort in die env-Datei auf dem Server, siehe `docs/deploy.md`:

| Wo                  | Name              | Was hin muss                                                                         |
| ------------------- | ----------------- | ------------------------------------------------------------------------------------ |
| Variable            | `SMTP_HOST`       | Postausgangsserver des Mail-Providers, etwa `smtp.hostinger.com`.                    |
| Variable            | `SMTP_PORT`       | `587` für STARTTLS oder `465` für implizites TLS. Ohne Angabe wird `587` genommen.   |
| Variable            | `SMTP_USER`       | Postfach, über das versandt wird. In der Regel dieselbe Adresse wie `kontakt.email`. |
| Secret              | `SMTP_PASSWORD`   | Kennwort dieses Postfachs. Als Secret, nicht als Variable.                           |
| Variable (optional) | `SMTP_ABSENDER`   | Absenderadresse der Formularmails. Leer: dann wird `SMTP_USER` verwendet.            |
| Variable (optional) | `SMTP_EMPFAENGER` | Zielpostfach der Anfragen. Leer: dann `kontakt.email` aus `shared/site.ts`.          |

Nach dem ersten Deploy einmal von Hand prüfen: eine Anfrage über das Formular abschicken und
sehen, ob sie im Studiopostfach ankommt. Kommt sie nicht an, steht der Grund im Containerlog
(`docker logs sf-landing-<env> | grep kontakt`), nicht in der Antwort an den Browser.

### Impressum (`app/pages/impressum.vue`) — erledigt

Der Name der Inhaberin steht in `shared/site.ts`, damit die drei Stellen im Impressum und in der
Datenschutzerklärung nicht auseinanderlaufen. Die Umsatzsteuerangabe ist der Hinweis nach § 19
UStG; eine USt-IdNr. nach § 27 a UStG wird nicht geführt und ist ohne Erteilung auch nicht
verlangt.

Sollte die Umsatzgrenze des § 19 UStG einmal überschritten werden, ersetzt die dann erteilte
Nummer diesen Absatz.

### Datenschutzerklärung (`app/pages/datenschutz.vue`)

Erledigt: Name der Inhaberin, Standort des Servers (Deutschland) und Anbieter (Hostinger). Der
Absatz zum Kontaktformular nennt die verarbeiteten Felder, die Rechtsgrundlagen und die
Frequenzgrenze; er beschreibt den Stand von `server/api/kontakt.post.ts` und muss mitgeändert
werden, wenn dort Felder, Speicherung oder Spamschutz dazukommen. Mit dem Mail-Provider, über
dessen Server die Formularmails laufen, muss ein Auftragsverarbeitungsvertrag bestehen.

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
   Änderung auf der Website. Name und Adresse müssen dort zeichengleich mit `shared/site.ts`
   übereinstimmen. Wer im Profil eine Rufnummer hinterlegt, sollte wissen, dass die Website
   bewusst keine nennt — dann kommen Anrufe an, für die es auf der Seite keinen Kanal gibt.
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
