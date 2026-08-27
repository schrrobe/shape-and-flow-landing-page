import type { H3Event } from 'h3'

/**
 * Prepares the answer of one of the read-only documents under /.well-known/.
 *
 * Three things belong together here, which is why they sit in one function: the endpoints all
 * answer the same two methods, all are readable from any origin, and each has a content type it
 * has to name itself.
 *
 * HEAD is not optional. RFC 9727, section 2, asks a publisher to answer a HEAD request to
 * /.well-known/api-catalog, and a client probing whether a document exists at all sends HEAD as a
 * matter of course. The route files therefore carry no `.get` in their name: Nitro derives the
 * method from that suffix, and a handler registered for GET answers a HEAD request with 404 — this
 * was measured, not assumed. Which is why the method is checked here instead.
 */
export function serveDocument(event: H3Event, contentType: string): void {
  if (event.method !== 'GET' && event.method !== 'HEAD') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }

  setResponseHeader(event, 'allow', 'GET, HEAD')
  setResponseHeader(event, 'content-type', contentType)
  /*
   * Readable from any origin, for every document here and not only for the ARD manifest that
   * requires it: they are public, unauthenticated and exist to be fetched by someone else's
   * client. Without the header an agent running in a browser gets the answer and is not allowed to
   * read it — the one case in which discovery fails although everything is in place.
   */
  setResponseHeader(event, 'access-control-allow-origin', '*')
}
