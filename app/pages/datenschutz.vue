<script setup lang="ts">
import { adresse, kontakt, site } from '#shared/site'

/*
 * Datenschutzerklärung.
 *
 * Sie ist kurz, weil die Website wenig tut: keine Cookies, kein Tracking, keine Formulare, keine
 * eingebetteten Karten oder Videos, Schriften selbst gehostet. Genau das steht hier auch. Wenn
 * später ein Kontaktformular, ein Pixel oder eine eingebettete Karte dazukommt, muss dieser Text
 * erweitert werden, und dann wird auch eine Einwilligungslösung fällig.
 */
useSeite({
  titel: 'Datenschutzerklärung',
  beschreibung: `Wie ${site.name} mit personenbezogenen Daten umgeht. Ohne Tracking und ohne Cookies.`,
  ogLabel: 'Rechtliches',
})

useHead({ meta: [{ name: 'robots', content: 'noindex, follow' }] })
</script>

<template>
  <article>
    <SfSeitenkopf
      titel="Datenschutzerklärung"
      label="Rechtliches"
      lead="Diese Website setzt keine Cookies, bindet keine Werbe- oder Analysedienste ein und lädt
        keine Inhalte von fremden Servern."
    />

    <div class="sf-container">
      <div class="sf-prose">
        <h2 class="mt-0!">Verantwortliche Stelle</h2>
        <p>
          {{ site.name }}<br />
          <!-- TODO: identisch zum Impressum -->
          [Vor- und Nachname der Inhaberin eintragen]<br />
          {{ adresse.strasse }}, {{ adresse.plz }} {{ adresse.ort }}<br />
          E-Mail: {{ kontakt.email }}<br />
          Telefon: {{ kontakt.telefonAnzeige }}
        </p>

        <h2>Was beim Aufruf der Website passiert</h2>
        <p>
          Beim Aufruf einer Seite überträgt Ihr Browser technisch notwendige Daten an unseren
          Server. Der Server hält sie kurzzeitig in Protokolldateien:
        </p>
        <ul>
          <li>Ihre IP-Adresse</li>
          <li>Datum und Uhrzeit des Zugriffs</li>
          <li>die aufgerufene Adresse</li>
          <li>die übertragene Datenmenge und der Statuscode</li>
          <li>Browsertyp und Betriebssystem</li>
          <li>die zuvor besuchte Seite, falls Ihr Browser sie mitsendet</li>
        </ul>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt im
          technisch fehlerfreien Betrieb und in der Sicherheit der Website. Diese Daten werden nicht
          mit anderen Quellen zusammengeführt und nicht zur Analyse Ihres Verhaltens verwendet. Sie
          werden nach kurzer Zeit gelöscht, sofern sie nicht zur Aufklärung eines Angriffs benötigt
          werden.
        </p>

        <h2>Keine Cookies, kein Tracking</h2>
        <p>
          Diese Website speichert keine Cookies und verwendet keine Analyse-, Tracking- oder
          Werbedienste. Deshalb gibt es hier auch kein Einwilligungsbanner. Die verwendete Schrift
          wird von unserem eigenen Server geladen, es entsteht also keine Verbindung zu Google Fonts
          oder einem anderen Anbieter.
        </p>

        <h2>Kontaktaufnahme</h2>
        <p>
          Wenn Sie uns per E-Mail, Telefon oder WhatsApp erreichen, verarbeiten wir Ihre Angaben zur
          Bearbeitung Ihrer Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO bei einer
          Terminanfrage, sonst Art. 6 Abs. 1 lit. f DSGVO. Wir bewahren die Angaben so lange auf,
          wie es für die Anfrage nötig ist, und darüber hinaus nur, soweit gesetzliche
          Aufbewahrungsfristen bestehen.
        </p>
        <p>
          Für WhatsApp gilt zusätzlich: der Dienst wird von WhatsApp Ireland Limited betrieben, und
          bei der Nutzung werden Daten nach dessen eigenen Bestimmungen verarbeitet, auf die wir
          keinen Einfluss haben. Wenn Sie das nicht möchten, nutzen Sie bitte Telefon oder E-Mail.
        </p>
        <p>
          Bitte senden Sie uns keine Angaben zu Ihrer Gesundheit per Nachricht. Was gesundheitlich
          zu beachten ist, besprechen wir im Studio.
        </p>

        <h2>Online-Terminbuchung</h2>
        <p>
          Für die Terminbuchung verlinken wir auf ein eigenes Buchungssystem unter einer anderen
          Adresse. Sobald Sie diesem Link folgen, gilt die Datenschutzerklärung des Buchungssystems.
        </p>

        <h2>Externe Links</h2>
        <p>
          Wir verlinken auf Google Maps, um Ihnen die Anfahrt zu erleichtern. Die Karte ist nicht
          eingebettet, sondern verlinkt: es werden also erst dann Daten an Google übertragen, wenn
          Sie den Link anklicken.
        </p>

        <h2>Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art.
          17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und
          Widerspruch gegen eine Verarbeitung auf Grundlage berechtigter Interessen (Art. 21). Eine
          erteilte Einwilligung können Sie jederzeit widerrufen.
        </p>
        <p>
          Wenden Sie sich dafür an die oben genannte Adresse. Außerdem können Sie sich bei einer
          Datenschutzaufsichtsbehörde beschweren, etwa bei der Landesbeauftragten für Datenschutz
          und Informationsfreiheit Nordrhein-Westfalen.
        </p>

        <h2>Hosting</h2>
        <p>
          <!-- TODO: Namen und Sitz des Hosting-Anbieters ergänzen und, falls nötig, auf den
               Auftragsverarbeitungsvertrag hinweisen -->
          Die Website wird auf einem Server in [Land eintragen] betrieben, den wir bei [Anbieter
          eintragen] gemietet haben. Mit dem Anbieter besteht ein Vertrag zur Auftragsverarbeitung
          nach Art. 28 DSGVO.
        </p>
      </div>
    </div>
  </article>
</template>
