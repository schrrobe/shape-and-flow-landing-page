import type { ModelContextLike } from '../utils/webmcp'

/*
 * WebMCP is not in the DOM types yet, and the two places where the API is found differ between
 * the specification (document) and the browser preview (navigator). Both optional: a browser
 * without the API is the normal case, and the plugin has to be able to ask.
 */
declare global {
  interface Document {
    modelContext?: ModelContextLike
  }

  interface Navigator {
    modelContext?: ModelContextLike
  }
}

export {}
