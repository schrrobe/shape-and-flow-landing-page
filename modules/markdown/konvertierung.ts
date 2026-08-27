import TurndownService from 'turndown'

/*
 * A prerendered page as Markdown.
 *
 * The Markdown is not a second source of the content but a representation of the page that is
 * actually delivered: it is taken from the finished HTML, after the components have rendered. So
 * there is nothing to keep in sync — a paragraph that changes in the template changes here with
 * the next build, and a page that does not exist has no Markdown either.
 *
 * Only what is inside <main> is converted. Header, navigation, footer and the skip link are on
 * every one of the thirteen pages and would be thirteen times the same noise in front of every
 * answer an agent gives from this.
 */

/** What the front matter of the generated file says. */
interface FrontMatter {
  title: string
  canonicalUrl: string
}

/*
 * The five entities Vue escapes in text. Deliberately no general entity decoder: the templates
 * write German text with umlauts and ® literally into the HTML, and only these five come back
 * escaped.
 */
const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
}

function decode(text: string): string {
  return text.replace(/&(amp|lt|gt|quot|#39);/g, entity => ENTITIES[entity] ?? entity)
}

/**
 * The content of the single <main> element of the page.
 *
 * Searched for with indexOf rather than a regular expression: the content contains everything the
 * page has to offer, including quotation marks, angle brackets and closing tags of its own, and a
 * greedy `<main.*?</main>` would stop at the first nested tag that looks like the end.
 * app/layouts/default.vue and app/layouts/linktree.vue each open exactly one <main>.
 */
function mainContent(html: string): string | null {
  const opening = html.indexOf('<main')
  if (opening === -1) return null

  const start = html.indexOf('>', opening)
  const end = html.lastIndexOf('</main>')
  if (start === -1 || end === -1 || end < start) return null

  return html.slice(start + 1, end)
}

function frontMatter(html: string): FrontMatter {
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/)?.[1] ?? ''
  const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1] ?? ''

  return { title: decode(title), canonicalUrl: decode(canonical) }
}

/** One table cell as a single line: a cell containing a line break breaks the table. */
function cellText(service: TurndownService, cell: Node): string {
  return service
    .turndown(cell as HTMLElement)
    .replace(/\s*\n+\s*/g, ' — ')
    .replaceAll('|', '\\|')
    .trim()
}

/**
 * The rows of a table, each as a list of cells.
 *
 * Walks the children instead of asking querySelectorAll: in the build Turndown parses with its own
 * minimal DOM, and that one does not have the query methods a browser has. What lies between table
 * and row — thead, tbody, tfoot — is skipped over, which is also why this recurses.
 */
function tableRows(service: TurndownService, node: Node): string[][] {
  const rows: string[][] = []

  for (const child of [...node.childNodes]) {
    // 1 is Node.ELEMENT_NODE. Whitespace between the tags is text and has no cells.
    if (child.nodeType !== 1) continue

    if (child.nodeName === 'TR')
      rows.push(
        [...child.childNodes]
          .filter(cell => cell.nodeType === 1)
          .map(cell => cellText(service, cell)),
      )
    else rows.push(...tableRows(service, child))
  }

  return rows
}

/**
 * The price table as a GFM table.
 *
 * Turndown has no rule of its own for tables, and without one the prices would end up as a run of
 * text — the one page whose figures an agent quotes most often. The heading row is the first row;
 * the group heading in the middle of the price table spans both columns and is padded to the
 * width of the table here, otherwise the table ends at that point for a Markdown parser.
 */
function tableRule(service: TurndownService): TurndownService.Rule {
  return {
    filter: 'table',
    replacement: (_content, node) => {
      const rows = tableRows(service, node)
      if (!rows.length) return ''

      const width = Math.max(...rows.map(row => row.length))
      const line = (cells: string[]): string =>
        `| ${[...cells, ...Array(width - cells.length).fill('')].join(' | ')} |`

      const [head, ...body] = rows

      return [
        '\n\n',
        line(head ?? []),
        '\n',
        line(Array(width).fill('---')),
        '\n',
        body.map(line).join('\n'),
        '\n\n',
      ].join('')
    },
  }
}

function createService(): TurndownService {
  const service = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    hr: '---',
    emDelimiter: '*',
  })

  /*
   * Decoration and controls. The icons are decorative, and an input field has no text an agent
   * could read — what stays is the label in front of it, and that is the part that says what the
   * form asks for.
   */
  service.remove(['script', 'style', 'noscript', 'input', 'select', 'textarea', 'button'])
  // As a filter and not in the list above: Turndown types its list against the HTML elements, and
  // svg is not one of them.
  service.remove(node => node.nodeName.toLowerCase() === 'svg')

  service.addRule('ariaHidden', {
    filter: node => node.getAttribute('aria-hidden') === 'true',
    replacement: () => '',
  })

  // The questions of the FAQ sit in <summary>, i.e. in an element Turndown does not know and
  // whose text would end up glued to the answer without this rule.
  service.addRule('summary', {
    filter: 'summary',
    replacement: content => `\n\n**${content.trim()}**\n\n`,
  })

  service.addRule('table', tableRule(service))

  return service
}

/**
 * The Markdown representation of a prerendered page, or null if the HTML has no <main>.
 *
 * With front matter, because a Markdown file that is delivered on its own has to be able to say
 * what page it is and where the original lives. Both are read from the HTML itself, so the title
 * here is the one the browser bar and the search result show.
 */
export function pageMarkdown(html: string): string | null {
  const content = mainContent(html)
  if (content === null) return null

  const { title, canonicalUrl } = frontMatter(html)
  const body = createService()
    .turndown(content)
    // Turndown separates blocks with blank lines; removed decoration leaves more behind.
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return `---
title: ${JSON.stringify(title)}
canonical_url: ${JSON.stringify(canonicalUrl)}
---

${body}
`
}
