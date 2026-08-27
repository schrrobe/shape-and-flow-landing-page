import { describe, expect, it, vi } from 'vitest'

import { treatments } from '#shared/behandlungen'
import { registerWebMcpTools, webMcpTools, type ModelContextLike, type WebMcpTool } from './webmcp'

/*
 * What is tested is the contract with an agent, not the wording of the descriptions: the names
 * survive what the specification allows, every tool answers from shared/, and registration finds
 * both shapes of the API. The texts in shared/ may be reworded without turning anything red here.
 */

const page = {
  routes: ['/', '/faq', '/kontakt', '/preise'],
  navigate: vi.fn(async (path: string) => path),
}

const tools = webMcpTools(page)
const tool = (name: string): WebMcpTool => {
  const found = tools.find(t => t.name === name)
  expect(found, `No tool named ${name}.`).toBeDefined()
  return found!
}

describe('webMcpTools', () => {
  it('gives every tool a name the specification accepts', () => {
    for (const t of tools) {
      // ModelContextTool: 1–128 characters, ASCII letters, digits and _ - . only.
      expect(t.name).toMatch(/^[A-Za-z0-9_.-]{1,128}$/)
      expect(t.description.length).toBeGreaterThan(0)
      expect(t.inputSchema).toHaveProperty('type', 'object')
    }
    expect(new Set(tools.map(t => t.name)).size).toBe(tools.length)
  })

  it('marks everything except navigation as read-only', () => {
    const writing = tools.filter(t => t.annotations?.readOnlyHint === false)

    expect(writing.map(t => t.name)).toEqual(['seite_oeffnen'])
  })

  it('offers no tool for appointments or for the contact form', () => {
    // The boundary from the agent documentation: the form is rate-limited per IP address and a
    // request is answered by a person. A tool for it would undo that decision.
    const surface = tools.map(t => `${t.name} ${t.description}`).join(' ')

    expect(surface).not.toMatch(/booking\.shapeandflow|\/api\/kontakt/)
    expect(tools.some(t => /absend|buch/i.test(t.name))).toBe(false)
  })

  it('names the prices from behandlungen.ts', async () => {
    const answer = (await tool('angebot_und_preise').execute({})) as {
      behandlungen: { name: string; preisEuro: number }[]
      pakete: unknown[]
    }

    expect(answer.behandlungen.map(b => b.name)).toEqual(treatments.map(t => t.name))
    expect(answer.behandlungen[0]?.preisEuro).toBe(treatments[0]?.priceEuro)
    expect(answer.pakete.length).toBeGreaterThan(0)
  })

  it('finds the answer on contraindications', async () => {
    const answer = (await tool('faq_durchsuchen').execute({
      frage: 'Gegenanzeigen Thrombose',
    })) as {
      treffer: { frage: string; antwort: string }[]
    }

    expect(answer.treffer.length).toBeGreaterThan(0)
    expect(answer.treffer[0]?.antwort).toContain('Thrombose')
  })

  it('hands back the questions when nothing matches', async () => {
    const answer = (await tool('faq_durchsuchen').execute({
      frage: 'Parkhaus Eintrittskarte',
    })) as {
      treffer: unknown[]
      alleFragen?: string[]
    }

    expect(answer.treffer).toHaveLength(0)
    expect(answer.alleFragen?.length).toBeGreaterThan(0)
  })

  it('restricts the search to a topic', async () => {
    const answer = (await tool('faq_durchsuchen').execute({
      frage: 'Kosten Behandlung',
      thema: 'health',
    })) as { treffer: { themen: string[] }[] }

    for (const hit of answer.treffer) expect(hit.themen).toContain('health')
  })

  it('takes only the routes of this site as a path', async () => {
    const schema = tool('seite_oeffnen').inputSchema as {
      properties: { pfad: { enum: string[] } }
    }
    expect(schema.properties.pfad.enum).toEqual(page.routes)

    await expect(tool('seite_oeffnen').execute({ pfad: '/gibt-es-nicht' })).rejects.toThrow(
      /Unbekannter Pfad/,
    )
    expect(page.navigate).not.toHaveBeenCalled()
  })

  it('opens a page through the router and reports the path reached', async () => {
    const answer = (await tool('seite_oeffnen').execute({ pfad: '/preise' })) as { pfad: string }

    expect(page.navigate).toHaveBeenCalledWith('/preise')
    expect(answer.pfad).toBe('/preise')
  })

  it('reads a page as Markdown from its .md address', async () => {
    const fetchMock = vi.fn(async () => new Response('---\ntitle: "Preise"\n---\n'))
    vi.stubGlobal('fetch', fetchMock)

    const answer = (await tool('seite_als_markdown').execute({ pfad: '/preise' })) as {
      quelle: string
      markdown: string
    }

    expect(fetchMock).toHaveBeenCalledWith('/preise.md', expect.anything())
    expect(answer.quelle).toBe('/preise.md')
    expect(answer.markdown).toContain('title: "Preise"')
    vi.unstubAllGlobals()
  })
})

describe('registerWebMcpTools', () => {
  const signal = () => new AbortController().signal

  it('registers every tool one at a time where the specification is implemented', () => {
    const registerTool = vi.fn()

    expect(registerWebMcpTools(tools, signal(), [{ registerTool }])).toBe(1)
    expect(registerTool).toHaveBeenCalledTimes(tools.length)
    // The signal travels along; without it the tools cannot be unregistered.
    expect(registerTool.mock.calls[0]?.[1]).toHaveProperty('signal')
  })

  it('hands over the whole set where only provideContext exists', () => {
    const provideContext = vi.fn()

    expect(registerWebMcpTools(tools, signal(), [{ provideContext }])).toBe(1)
    expect(provideContext).toHaveBeenCalledWith({ tools })
  })

  it('takes back the set on abort, because provideContext knows no signal', () => {
    const provideContext = vi.fn()
    const controller = new AbortController()

    registerWebMcpTools(tools, controller.signal, [{ provideContext }])
    controller.abort()

    expect(provideContext).toHaveBeenLastCalledWith({ tools: [] })
  })

  it('prefers registerTool where a context offers both', () => {
    const context = { registerTool: vi.fn(), provideContext: vi.fn() }

    registerWebMcpTools(tools, signal(), [context])

    expect(context.registerTool).toHaveBeenCalled()
    expect(context.provideContext).not.toHaveBeenCalled()
  })

  it('registers one and the same context only once', () => {
    const context: ModelContextLike = { registerTool: vi.fn() }

    expect(registerWebMcpTools(tools, signal(), [context, context])).toBe(1)
    expect(context.registerTool).toHaveBeenCalledTimes(tools.length)
  })

  it('does nothing in a browser without the API', () => {
    expect(registerWebMcpTools(tools, signal(), [undefined, {}])).toBe(0)
  })

  it('survives a registration that fails', () => {
    const registerTool = vi.fn(() => Promise.reject(new Error('InvalidStateError')))

    expect(() => registerWebMcpTools(tools, signal(), [{ registerTool }])).not.toThrow()
  })
})
