<script setup lang="ts">
import { address, contact, site } from '#shared/site'

/*
 * Privacy policy.
 *
 * It is short because the site does little: no cookies, no tracking, no embedded maps or videos,
 * fonts self-hosted. That is exactly what it says here. If a pixel or an embedded map is added
 * later, this text has to be extended, and then a consent solution becomes due as well.
 *
 * The contact form is the only processing originating from the site itself. It sets no cookie and
 * loads no third-party captcha, which is why the paragraph further down suffices and no consent
 * under § 25 TDDDG is needed. Whoever extends the form with a captcha, an analytics tool or
 * storage of the requests has to change that paragraph — the details there are Art. 13 mandatory
 * information, not a description.
 *
 * The form deliberately has no consent checkbox, and this text therefore names no consent as the
 * legal basis for the request itself. A consent without which the form does nothing would not be
 * freely given under Art. 7(4) GDPR; Art. 6(1)(b) resp. (f) carries the request on its own.
 * Whoever puts the checkbox back has to change both together.
 *
 * The "reply via WhatsApp" choice is the one point where a consent does apply, and there it
 * holds: email stays preselected, whoever touches nothing gives nothing to WhatsApp, and the
 * request is answered without the choice too. That is exactly what makes it voluntary.
 */
usePage({
  title: 'Datenschutzerklärung',
  description: `Wie ${site.name} mit personenbezogenen Daten umgeht. Ohne Tracking und ohne Cookies.`,
  ogLabel: 'Rechtliches',
})

useHead({ meta: [{ name: 'robots', content: 'noindex, follow' }] })

const bookingVisible = useBookingVisible()
</script>

<template>
  <article>
    <SfSeitenkopf
      title="Datenschutzerklärung"
      label="Rechtliches"
      lead="Diese Website setzt keine Cookies, bindet keine Werbe- oder Analysedienste ein und lädt
        keine Inhalte von fremden Servern."
    />

    <div class="sf-container">
      <div class="sf-prose">
        <h2 class="mt-0!">Verantwortliche Stelle</h2>
        <p>
          {{ site.name }}<br />
          {{ site.owner }}<br />
          {{ address.street }}, {{ address.postalCode }} {{ address.city }}<br />
          E-Mail: {{ contact.email }}
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
          Stands and falls with the booking links: without them the section describes a processing
          that cannot happen on this site at all.
        -->
        <template v-if="bookingVisible">
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
          <!-- The registered seat of the contracting party deliberately does not appear here: it
               belongs in the data processing agreement, and Art. 13 GDPR asks for the recipient
               at this point, not for its commercial register address. Whoever wants to add the
               full company name takes it from the DPA and not from the Hostinger website. -->
          Die Website wird auf einem Server in Deutschland betrieben, den wir bei Hostinger gemietet
          haben. Mit dem Anbieter besteht ein Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO.
        </p>
      </div>
    </div>
  </article>
</template>
