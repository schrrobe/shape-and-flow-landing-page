import { markdownPath } from '#shared/agenten'
import { comboAnchor, formatPrice, priceItems, priceRange, treatments } from '#shared/behandlungen'
import { faq, faqAnswerText, type FaqEntry, type FaqTopic } from '#shared/faq'
import { address, contact, disclaimer, formUrl, mapUrl, openingHours, site } from '#shared/site'

/*
 * What an agent can do with this site while it stands in the page.
 *
 * WebMCP is the third way to the same content, next to the Markdown representation and the
 * endpoints under /.well-known/: an agent that already has the page open no longer has to read the
 * HTML and guess: it calls a tool and gets the answer as data. The tools therefore say nothing the
 * site does not already say elsewhere — they answer from shared/, i.e. from the same lists that
 * feed the price table, the FAQ and the structured data. A price only exists in one place, and no
 * tool can name a different one than the page.
 *
 * The boundaries are the same as in the agent documentation: reading only. There is no tool for an
 * appointment or for the contact form, because the form is rate-limited per IP address and a
 * request is answered by a person. Whoever asks about an appointment is pointed at the form and at
 * the email address — exactly as at /.well-known/agent.md.
 *
 * Registration goes through registerWebMcpTools below, and the descriptions are in German like
 * the rest of the content: a model that reads them answers in the language of the site.
 */

/** A tool as {@link ModelContextLike} takes it — `ModelContextTool` in the WebMCP specification. */
export interface WebMcpTool {
  /** 1–128 characters, ASCII letters, digits and `_`, `-`, `.` only. */
  name: string
  description: string
  /** JSON Schema of the arguments. */
  inputSchema: object
  annotations?: { readOnlyHint?: boolean }
  execute: (input: Record<string, unknown>, options?: { signal?: AbortSignal }) => Promise<unknown>
}

/**
 * The API as it is found in the field.
 *
 * The specification puts `modelContext` on the document and registers one tool at a time; the
 * older explainer and the browser preview put it on the navigator and take the whole set in one
 * call. Both members are optional here because neither shape has settled — which of the two
 * answers is decided at runtime by {@link registerWebMcpTools}, not here.
 */
export interface ModelContextLike {
  registerTool?: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => unknown
  provideContext?: (context: { tools: WebMcpTool[] }) => unknown
}

/** What the tools need from the page: the router and the list of its routes. */
export interface WebMcpPage {
  /** Every public route of this site, for the two tools that take a path. */
  routes: string[]
  /** Opens a route without a reload and answers with the path actually reached. */
  navigate: (path: string) => Promise<string>
}

/** An object schema without arguments. `additionalProperties` so a model does not invent any. */
const noInput = { type: 'object', properties: {}, additionalProperties: false } as const

/** A word of the search query worth comparing. Shorter ones match everywhere and say nothing. */
function terms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-zäöüß0-9]+/)
    .filter(word => word.length > 3)
}

/** How well an FAQ entry answers a query: how many of its words appear in question and answer. */
function score(entry: FaqEntry, query: string[]): number {
  const haystack = `${entry.question} ${faqAnswerText(entry)}`.toLowerCase()
  return query.filter(word => haystack.includes(word)).length
}

/**
 * The tools this page offers, in the order in which they are registered.
 *
 * As a function of the page and not as a constant, because two of them need the router — and
 * because the list of routes comes from the router itself rather than being written out here. A
 * new page is thus part of the tools with the next build, and one that is deleted disappears from
 * them.
 */
export function webMcpTools(page: WebMcpPage): WebMcpTool[] {
  /** The paths both path tools accept. As an enum, so a model cannot ask for a page that is not. */
  const pathSchema = {
    type: 'object',
    properties: {
      pfad: {
        type: 'string',
        enum: page.routes,
        description: 'Pfad einer Seite dieser Website, mit führendem Schrägstrich.',
      },
    },
    required: ['pfad'],
    additionalProperties: false,
  } as const

  /** The path out of the arguments, or an error a model can act on. */
  const requirePath = (input: Record<string, unknown>): string => {
    const path = typeof input.pfad === 'string' ? input.pfad : ''
    if (!page.routes.includes(path)) {
      throw new Error(
        `Unbekannter Pfad: ${path || '(leer)'}. Bekannt sind: ${page.routes.join(', ')}`,
      )
    }
    return path
  }

  return [
    {
      name: 'angebot_und_preise',
      description:
        `Nennt alle Behandlungen von ${site.name} mit Preis und Seite, dazu die Kombitermin- ` +
        'und Paketpreise. Beantwortet Fragen nach Angebot, Kosten und Preisspanne ohne Eingabe.',
      inputSchema: noInput,
      annotations: { readOnlyHint: true },
      execute: async () => ({
        behandlungen: treatments.map(t => ({
          name: t.name,
          titel: t.title,
          beschreibung: t.summary,
          preis: formatPrice(t.priceEuro),
          preisEuro: t.priceEuro,
          seite: t.route,
        })),
        pakete: priceItems.map(p => ({
          name: p.name,
          hinweis: p.note,
          preis: formatPrice(p.priceEuro),
          preisEuro: p.priceEuro,
        })),
        preisspanne: priceRange,
        seiten: { uebersicht: '/preise', kombitermin: comboAnchor },
        hinweis: disclaimer,
      }),
    },

    {
      name: 'faq_durchsuchen',
      description:
        'Sucht in den häufigen Fragen dieses Studios — Ablauf, Wirkung, Gegenanzeigen, ' +
        'Schwangerschaft, Kosten, Krankenkasse — und gibt die Antworten im Wortlaut der Seite ' +
        'zurück. Die Frage in natürlicher Sprache übergeben.',
      inputSchema: {
        type: 'object',
        properties: {
          frage: {
            type: 'string',
            description: 'Die Frage oder die Stichworte, zu denen eine Antwort gesucht wird.',
          },
          thema: {
            type: 'string',
            enum: ['general', 'procedure', 'health', 'prices', 'body', 'face'],
            description: 'Optionale Einschränkung auf ein Thema.',
          },
        },
        required: ['frage'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async input => {
        const thema = input.thema as FaqTopic | undefined
        const query = terms(typeof input.frage === 'string' ? input.frage : '')
        const candidates = thema ? faq.filter(e => e.topics.includes(thema)) : faq

        const matches = candidates
          .map(entry => ({ entry, hits: score(entry, query) }))
          .filter(match => match.hits > 0)
          .sort((a, b) => b.hits - a.hits)
          .slice(0, 3)
          .map(match => match.entry)

        return {
          treffer: matches.map(entry => ({
            frage: entry.question,
            antwort: faqAnswerText(entry),
            themen: entry.topics,
          })),
          // Nothing matched: the list of questions instead of an empty answer, so the agent can
          // pick one without a second call.
          ...(matches.length ? {} : { alleFragen: candidates.map(entry => entry.question) }),
          seite: '/faq',
          hinweis: disclaimer,
        }
      },
    },

    {
      name: 'kontakt_und_anfahrt',
      description:
        `Adresse, Anfahrt und Kontaktweg von ${site.name}. Nennt auch, wie ein Termin ` +
        'zustande kommt. Sendet selbst nichts und vereinbart keinen Termin.',
      inputSchema: noInput,
      annotations: { readOnlyHint: true },
      execute: async () => ({
        studio: site.name,
        // The sign on the door reads differently from the studio's name — without this line
        // someone stands in front of the right house and turns back.
        gebaeude: address.venue,
        strasse: address.street,
        plz: address.postalCode,
        ort: address.city,
        stadtteil: address.district,
        email: contact.email,
        kontaktformular: formUrl,
        karte: mapUrl,
        termine: openingHours.note,
        hinweis:
          'Terminanfragen gehen an das Kontaktformular oder an die E-Mail-Adresse. Vereinbart ' +
          'wird der Termin zwischen Mensch und Studio; es gibt hier keine Buchungsschnittstelle.',
      }),
    },

    {
      name: 'seite_oeffnen',
      description:
        'Öffnet eine Seite dieser Website im aktuellen Tab, ohne Neuladen. Danach steht deren ' +
        'Inhalt im Dokument. Zum reinen Lesen genügt seite_als_markdown.',
      inputSchema: pathSchema,
      // The only tool that changes something: the page the visitor is looking at.
      annotations: { readOnlyHint: false },
      /*
       * Answers with the path and nothing else. The title would be the obvious second field, but
       * it is set by unhead after the route change and is still the one of the previous page one
       * tick later — a stale title is worse than none, and the content is in the document anyway.
       */
      execute: async input => ({
        pfad: await page.navigate(requirePath(input)),
        hinweis: 'Die Seite ist geladen. Ihr Inhalt steht im Dokument.',
      }),
    },

    {
      name: 'seite_als_markdown',
      description:
        'Liefert eine Seite dieser Website als Markdown — dieselbe Darstellung wie unter ' +
        '<Seite>.md. Zum Lesen von Inhalten, ohne die aktuelle Seite zu verlassen.',
      inputSchema: pathSchema,
      annotations: { readOnlyHint: true },
      execute: async (input, options) => {
        const path = requirePath(input)
        const response = await fetch(markdownPath(path), {
          headers: { accept: 'text/markdown' },
          signal: options?.signal,
        })
        if (!response.ok) {
          throw new Error(`${markdownPath(path)} antwortet mit ${response.status}.`)
        }
        return { pfad: path, quelle: markdownPath(path), markdown: await response.text() }
      },
    },
  ]
}

/** Where the API sits in this browser, in the order in which the two shapes appeared. */
export function modelContexts(): (ModelContextLike | undefined)[] {
  if (typeof document === 'undefined') return []
  return [document.modelContext, navigator.modelContext]
}

/**
 * Runs a registration call and drops whatever comes back out of it.
 *
 * A failed registration must not take the page with it: without the API the page works as before,
 * so a browser whose implementation throws must not end up worse off than one that has none at all.
 * console.* is out of the question on a prerendered page, so there is nowhere to report it either.
 *
 * Both ways out are caught, because the API offers both: the specification has `registerTool`
 * return a promise, but an implementation that validates its argument throws before that promise
 * ever exists — and a `try` around the call alone would let the rejection through.
 */
function swallowFailure(call: () => unknown): void {
  try {
    void Promise.resolve(call()).catch(() => undefined)
  } catch {
    // Nothing to do: the page is meant to carry on without these tools.
  }
}

/**
 * Hands the tools to every model context this browser offers.
 *
 * Both shapes are served, because the API has not settled and the answer costs a type check: the
 * specification's `registerTool` takes one tool plus the signal that unregisters it again, the
 * older `provideContext` takes the whole set at once and knows no signal — there, an abort hands
 * over an empty set. Where an object offers both, `registerTool` wins: only that one can be
 * undone.
 *
 * Returns the number of contexts that took the tools, so the test can tell registration from a
 * browser without the API.
 */
export function registerWebMcpTools(
  tools: WebMcpTool[],
  signal: AbortSignal,
  contexts: (ModelContextLike | undefined)[] = modelContexts(),
): number {
  const seen = new Set<ModelContextLike>()
  let registered = 0

  for (const context of contexts) {
    // The same object can sit on document and navigator at once; registering twice would offer
    // every tool twice.
    if (!context || seen.has(context)) continue
    seen.add(context)

    if (typeof context.registerTool === 'function') {
      const register = context.registerTool.bind(context)
      for (const tool of tools) {
        swallowFailure(() => register(tool, { signal }))
      }
      registered += 1
    } else if (typeof context.provideContext === 'function') {
      const provide = context.provideContext.bind(context)
      swallowFailure(() => provide({ tools }))
      signal.addEventListener('abort', () => swallowFailure(() => provide({ tools: [] })), {
        once: true,
      })
      registered += 1
    }
  }

  return registered
}
