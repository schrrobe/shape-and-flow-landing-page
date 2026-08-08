<script setup lang="ts">
import { adresse, kontakt, site } from '#shared/site'

/*
 * Datenschutzerklärung.
 *
 * Sie ist kurz, weil die Website wenig tut: keine Cookies, kein Tracking, keine eingebetteten
 * Karten oder Videos, Schriften selbst gehostet. Genau das steht hier auch. Wenn später ein Pixel
 * oder eine eingebettete Karte dazukommt, muss dieser Text erweitert werden, und dann wird auch
 * eine Einwilligungslösung fällig.
 *
 * Das Kontaktformular ist die einzige Verarbeitung, die von der Website selbst ausgeht. Es setzt
 * kein Cookie und lädt kein Captcha eines Drittanbieters, deshalb bleibt es beim Absatz weiter
 * unten und es kommt keine Einwilligung im Sinne des § 25 TDDDG dazu. Wer das Formular um ein
 * Captcha, ein Analysewerkzeug oder eine Speicherung der Anfragen erweitert, muss den Absatz
 * ändern — die Angaben dort sind Art.-13-Pflichtangaben, keine Beschreibung.
 *
 * Ein Einwilligungshäkchen hat das Formular bewusst nicht, und dieser Text nennt deshalb auch
 * keine Einwilligung als Rechtsgrundlage für die Anfrage selbst. Eine Einwilligung, ohne die das
 * Formular nichts tut, wäre nach Art. 7 Abs. 4 DSGVO nicht freiwillig; Art. 6 Abs. 1 lit. b bzw.
 * f trägt die Anfrage allein. Wer das Häkchen wieder einbaut, muss beides zusammen ändern.
 *
 * Die Wahl „Antwort per WhatsApp“ ist der eine Punkt, an dem doch eine Einwilligung steht, und
 * dort trägt sie: E-Mail bleibt voreingestellt, wer nichts anfasst, gibt nichts an WhatsApp ab,
 * und die Anfrage wird auch ohne die Wahl beantwortet. Genau das macht sie freiwillig.
 */
useSeite({
  titel: 'Datenschutzerklärung',
  beschreibung: `Wie ${site.name} mit personenbezogenen Daten umgeht. Ohne Tracking und ohne Cookies.`,
  ogLabel: 'Rechtliches',
})

useHead({ meta: [{ name: 'robots', content: 'noindex, follow' }] })

const buchungSichtbar = useBuchungSichtbar()
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
          {{ site.inhaberin }}<br />
          {{ adresse.strasse }}, {{ adresse.plz }} {{ adresse.ort }}<br />
          E-Mail: {{ kontakt.email }}
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
          Wenn Sie uns per E-Mail erreichen, verarbeiten wir Ihre Angaben zur Bearbeitung Ihrer
          Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO bei einer Terminanfrage, sonst
          Art. 6 Abs. 1 lit. f DSGVO. Wir bewahren die Angaben so lange auf, wie es für die Anfrage
          nötig ist, und darüber hinaus nur, soweit gesetzliche Aufbewahrungsfristen bestehen.
        </p>

        <h2>Kontaktformular</h2>
        <p>
          Über das Formular auf der Kontaktseite übermitteln Sie Ihren Namen, Ihre E-Mail-Adresse,
          Ihre Nachricht und, falls Sie sie angeben, Ihre Handynummer, die gewünschte Behandlung und
          Ihr Zeitfenster. Diese Angaben werden von unserem Server als E-Mail an unser
          Studiopostfach zugestellt und dort wie eine E-Mail-Anfrage behandelt. Auf dem Webserver
          selbst werden sie nicht gespeichert.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, weil die Nachricht der Vorbereitung eines
          Behandlungstermins dient, sonst Art. 6 Abs. 1 lit. f DSGVO; das berechtigte Interesse
          liegt darin, Anfragen zu beantworten. Eine Einwilligung holen wir für die Anfrage selbst
          nicht ein und das Formular verlangt auch keine: Wer eine Anfrage schickt, will eine
          Antwort, und die Verarbeitung ist genau dafür nötig. Nur für die Antwort per WhatsApp ist
          das anders, siehe unten.
        </p>
        <p>
          Zum Schutz vor automatisierten Zusendungen enthält das Formular ein verstecktes Feld und
          der Server begrenzt die Zahl der Übermittlungen je Internetanschluss. Dafür wird Ihre
          IP-Adresse für höchstens eine Stunde im Arbeitsspeicher gehalten. Rechtsgrundlage ist Art.
          6 Abs. 1 lit. f DSGVO, das berechtigte Interesse liegt in der Abwehr von Missbrauch. Es
          wird kein Captcha und kein Dienst eines Drittanbieters eingebunden.
        </p>
        <p>
          Im Formular können Sie wählen, ob wir per E-Mail oder per WhatsApp antworten.
          Voreingestellt ist die E-Mail. Wählen Sie WhatsApp, verwenden wir Ihre Handynummer, um
          Ihnen dort zu antworten; sie und der Inhalt unserer Nachricht werden dabei über die
          WhatsApp Ireland Limited verarbeitet, die zum Meta-Konzern gehört, und können dabei auch
          in die USA übermittelt werden. Für diese Übermittlung stützt sich WhatsApp auf den EU-US
          Data Privacy Framework und auf Standardvertragsklauseln der EU-Kommission. Rechtsgrundlage
          ist Ihre Einwilligung nach Art. 6 Abs. 1 lit. a und Art. 49 Abs. 1 lit. a DSGVO, die Sie
          mit dieser Wahl erteilen. Sie ist freiwillig: Wir beantworten Ihre Anfrage ebenso per
          E-Mail, und Sie können uns jederzeit formlos mitteilen, dass wir das tun sollen. Für den
          Rest des Formulars ändert die Wahl nichts.
        </p>
        <p>
          Bitte senden Sie uns keine Angaben zu Ihrer Gesundheit per Nachricht. Was gesundheitlich
          zu beachten ist, besprechen wir im Studio.
        </p>
        <p>
          Die E-Mails werden über den Mailserver unseres Providers versandt und in unserem Postfach
          bei diesem Provider abgelegt. Mit ihm besteht ein Vertrag zur Auftragsverarbeitung nach
          Art. 28 DSGVO.
        </p>

        <!--
          Steht und fällt mit den Buchungslinks: ohne sie beschreibt der Abschnitt eine
          Datenverarbeitung, zu der es auf dieser Website gar nicht kommen kann.
        -->
        <template v-if="buchungSichtbar">
          <h2>Online-Terminbuchung</h2>
          <p>
            Für die Terminbuchung verlinken wir auf ein eigenes Buchungssystem unter einer anderen
            Adresse. Sobald Sie diesem Link folgen, gilt die Datenschutzerklärung des
            Buchungssystems.
          </p>
        </template>

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
          Widerspruch gegen eine Verarbeitung auf Grundlage berechtigter Interessen (Art. 21).
        </p>
        <p>
          Wenden Sie sich dafür an die oben genannte Adresse. Außerdem können Sie sich bei einer
          Datenschutzaufsichtsbehörde beschweren, etwa bei der Landesbeauftragten für Datenschutz
          und Informationsfreiheit Nordrhein-Westfalen.
        </p>

        <h2>Hosting</h2>
        <p>
          <!-- Der Sitz der Vertragspartnerin steht bewusst nicht hier: er gehört in den
               Auftragsverarbeitungsvertrag, und Art. 13 DSGVO verlangt an dieser Stelle den
               Empfänger, nicht dessen Handelsregisteranschrift. Wer die vollständige Firmierung
               ergänzen will, nimmt sie aus dem AVV und nicht aus der Hostinger-Website. -->
          Die Website wird auf einem Server in Deutschland betrieben, den wir bei Hostinger gemietet
          haben. Mit dem Anbieter besteht ein Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO.
        </p>
      </div>
    </div>
  </article>
</template>
