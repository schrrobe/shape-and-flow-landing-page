import type { Behandlung } from '#shared/behandlungen'
import type { FaqEintrag } from '#shared/faq'
import { faqAntwortText } from '#shared/faq'
import { adresse, site } from '#shared/site'

/*
 * Alles, was jede Seite an Metadaten braucht, in einem Aufruf.
 *
 * Ohne das hier stünden auf zwölf Seiten je vier Blöcke Boilerplate, und beim dreizehnten würde
 * einer davon fehlen. Titel und Beschreibung wandern gleichzeitig in <title>, in die
 * Meta-Description, in die Open-Graph-Tags und in das Vorschaubild, sodass alle vier immer
 * dasselbe sagen.
 */

export interface SeiteOptions {
  /** Der Titel für die Browserleiste und die Suchergebnisse, ohne Firmenname am Ende. */
  titel: string
  /**
   * Die letzte Stufe des Brotkrümelpfads. Muss wörtlich mit dem `titel` von SfSeitenkopf
   * übereinstimmen: Google verlangt, dass die ausgezeichnete Krümelspur dieselbe ist wie die
   * sichtbare. Ohne Angabe wird `ogTitel` genommen, das auf den meisten Seiten schon die kurze
   * Fassung ist.
   */
  kurzTitel?: string
  /** Die Meta-Description. Zielmarke sind 140 bis 155 Zeichen. */
  beschreibung: string
  /**
   * Die Zwischenstufen des Brotkrümelpfads, also ohne Startseite und ohne die aktuelle Seite.
   * Beide setzt die Funktion selbst.
   */
  pfad?: { name: string, url: string }[]
  /** Das Label im Vorschaubild. Ohne Angabe steht dort der Firmenname. */
  ogLabel?: string
  /** Kürzere Fassung des Titels für das Vorschaubild, wenn der echte Titel dort zu lang wird. */
  ogTitel?: string
}

export function useSeite(options: SeiteOptions) {
  const route = useRoute()

  useSeoMeta({
    title: options.titel,
    description: options.beschreibung,
    ogTitle: `${options.titel} | ${site.name}`,
    ogDescription: options.beschreibung,
    ogType: 'website',
    ogSiteName: site.name,
    ogLocale: 'de_DE',
    twitterCard: 'summary_large_image',
  })

  defineOgImageComponent('SfOg', {
    title: options.ogTitel ?? options.titel,
    description: options.beschreibung,
    eyebrow: options.ogLabel ?? site.nameAscii,
  })

  // Die Startseite braucht keinen Brotkrümelpfad, der nur auf sie selbst zeigt.
  if (route.path !== '/') {
    useSchemaOrg([
      defineBreadcrumb({
        itemListElement: [
          { name: 'Startseite', item: '/' },
          ...(options.pfad ?? []).map(stufe => ({ name: stufe.name, item: stufe.url })),
          { name: options.kurzTitel ?? options.ogTitel ?? options.titel },
        ],
      }),
    ])
  }

  return { route }
}

/**
 * Die Fragen einer Seite als FAQ-Structured-Data.
 *
 * Die Seite muss dabei selbst als FAQPage ausgezeichnet werden, sonst hängt nuxt-schema-org die
 * Fragen nirgends ein: es verknüpft eine Question nur dann mit der Seite, wenn deren WebPage den
 * Typ FAQPage trägt — und den setzt es von allein nur unter /faq. Ohne diese Zeile stünden auf
 * einer Unterseite Question-Knoten im JSON-LD, auf die nichts zeigt.
 */
export function useFaqSchema(eintraege: FaqEintrag[]) {
  useSchemaOrg([
    defineWebPage({ '@type': 'FAQPage' }),
    ...eintraege.map(eintrag => defineQuestion({
      name: eintrag.frage,
      acceptedAnswer: faqAntwortText(eintrag),
    })),
  ])
}

/**
 * Der Ortszusatz, den jeder Seitentitel braucht, damit die lokale Suche greift. Als Funktion,
 * damit "Dortmund" nur in shared/site.ts steht.
 */
export function mitOrt(titel: string): string {
  return `${titel} ${adresse.ort}`
}

/**
 * Das Service-Structured-Data einer Behandlung samt Preis.
 *
 * Der Preis gehört hier ins Angebot und nicht nur in den sichtbaren Text: nur so kann Google ihn
 * im Suchergebnis anzeigen, und nur so lesen ihn KI-Agenten verlässlich aus.
 */
export function useBehandlungSchema(behandlung: Behandlung) {
  useSchemaOrg([
    defineService({
      name: behandlung.name,
      description: behandlung.kurz,
      serviceType: behandlung.titel,
      category: 'Beauty',
      areaServed: adresse.ort,
      offers: {
        price: behandlung.preisEuro,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
      },
    }),
  ])
}
