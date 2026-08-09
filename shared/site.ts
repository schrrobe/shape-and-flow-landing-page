/*
 * Every business fact the site states, in one place.
 *
 * The pages read from here and so does the structured data, which is the point: an address that
 * appears in the footer, on the contact page and in the LocalBusiness JSON-LD is one set of
 * strings, not three that can drift apart.
 *
 * Values marked TODO are placeholders and must be replaced before launch — see
 * docs/launch-checklist.md. Grep for "TODO" to find them all.
 */

export const site = {
  name: 'Shape & Flow',
  /** Used where the ampersand would need escaping or reads badly, e.g. in URLs and alt text. */
  nameAscii: 'Shape and Flow',
  /**
   * The owner. Appears three times on the site — in the imprint as the owner and as the person
   * responsible for the content, in the privacy policy as the controller. The DDG and the GDPR
   * require the same name in all those places; hence one constant instead of three.
   */
  owner: 'Karin Pospelov',
  tagline: 'Brasilianische Lymphdrainage in Dortmund',
  url: 'https://shapeandflow.de',
} as const

export const address = {
  /*
   * Shape & Flow is a guest in someone else's studio: the sign at the door reads
   * "Bellas Beauty", not "Shape & Flow". Without this line people stand in front of the
   * right house and turn back. Kept out of `street` on purpose, because street, postal
   * code and city go into the LocalBusiness structured data as they are.
   */
  venue: 'Bellas Beauty',
  street: 'Preinstraße 61',
  postalCode: '44265',
  city: 'Dortmund',
  country: 'DE',
  /** Dortmund-Wellinghofen/Hacheney, in the south of the city — for local references in copy. */
  district: 'Dortmund-Süd',
} as const

/*
 * Deliberately without a phone or WhatsApp number of its own: contact runs through email and the
 * contact form. § 5 DDG requires a quick electronic way to get in touch, not a phone number
 * (ECJ C-298/07), and a wa.me link would hand data to WhatsApp Ireland before anyone has sent a
 * message.
 *
 * The form does ask for a mobile number and lets people pick WhatsApp as the reply channel. That
 * is not a contradiction: there, the transfer to WhatsApp only starts with the studio's reply and
 * only if someone explicitly chose it. Listing a number here, by contrast, would mean showing it
 * on every page that carries the footer.
 */
export const contact = {
  /**
   * The address printed on the site — imprint, privacy policy, footer, mailto link and structured
   * data — and where the contact form requests end up.
   */
  email: 'hallo@shapeandflow.de',
  /**
   * Sender of the form emails, not meant for replies: the reply goes to the enquiring person via
   * Reply-To, not to this mailbox.
   *
   * A separate address rather than `email`, so the mailbox shows at a glance what comes from our
   * own server and what someone wrote by hand. It appears nowhere on the site — anyone writing to
   * it took it from a mail header.
   */
  senderEmail: 'nicht-antworten@shapeandflow.de',
  /** Address of the booking app. Every appointment button points here. */
  bookingUrl: 'https://booking.shapeandflow.de',
  /*
   * The social profiles. Without the share parameters the apps append (?igsh=, ?_r=, ?_t=):
   * those belong to the session the link was copied from and have no place in a fixed link.
   *
   * Either can be set to null, which removes it everywhere at once — see socialProfiles below.
   */
  instagram: 'https://www.instagram.com/shapeandflow.do' as string | null,
  tiktok: 'https://www.tiktok.com/@shapeandflow.do' as string | null,
} as const

/** One social profile as the site renders it. `icon` is the symbol name in SfIcon. */
export interface SocialProfile {
  name: string
  icon: 'instagram' | 'tiktok'
  url: string
}

/*
 * The profiles that are actually set, in the order they should appear.
 *
 * One list for all three places that name them: the footer, the link tree under /linktree and
 * the sameAs entry in the structured data. Without it, adding a profile would mean touching
 * three files and forgetting one of them.
 */
export const socialProfiles: SocialProfile[] = (
  [
    { name: 'Instagram', icon: 'instagram', url: contact.instagram },
    { name: 'TikTok', icon: 'tiktok', url: contact.tiktok },
  ] satisfies { name: string; icon: SocialProfile['icon']; url: string | null }[]
).filter((profile): profile is SocialProfile => profile.url !== null)

/**
 * No invented opening hours: the studio works by appointment, and that is also the statement
 * printed on the site and in the structured data.
 */
export const openingHours = {
  mode: 'by-appointment' as const,
  note: 'Termine nach Vereinbarung',
}

export const mailtoUrl = `mailto:${contact.email}`

/** Jump target of the contact form. Lives here because four pages link to it. */
export const formUrl = '/kontakt#formular'

/** A Google Maps search link instead of an embedded map: no third-party script, no consent needed. */
export const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${address.street}, ${address.postalCode} ${address.city}`,
)}`

/** The licence notice that has to appear on every page mentioning the brand. */
export const trademarkNotice =
  'Jeveauxeffect® und Jeveauxeffect Face® sind eingetragene Marken der Jeveaux Company®. ' +
  'Shape & Flow ist lizenzierter Partner der Jeveaux Company®.'

/**
 * The mandatory disclaimer from the licensor's documents. Appears on every page describing an
 * effect — required in substance by the Heilmittelwerbegesetz, not just by the licence agreement.
 */
export const disclaimer =
  'Der Jeveauxeffect® ist eine ästhetische Anwendung im Beauty-Bereich und keine medizinische ' +
  'oder therapeutische Behandlung. Er ersetzt keine ärztliche Maßnahme. Es werden keine ' +
  'Heilversprechen abgegeben. Die beschriebenen Effekte beruhen auf subjektiven Wahrnehmungen; ' +
  'individuelle Ergebnisse können abweichen.'
