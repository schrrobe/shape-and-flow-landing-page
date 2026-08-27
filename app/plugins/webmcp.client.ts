import { registerWebMcpTools, webMcpTools } from '../utils/webmcp'

/*
 * Registers the WebMCP tools while the page loads.
 *
 * Client-only, because the API lives in the browser: on the server there is no model context, and
 * the tools are about what an agent may do in an open page. The registration happens at load time
 * and not on demand — an agent, like a checking tool, looks at what the page offers right after
 * loading, and a tool registered later does not exist for it.
 *
 * The tools themselves are in app/utils/webmcp.ts; only what needs the router is here.
 */
export default defineNuxtPlugin(nuxtApp => {
  const router = useRouter()

  /*
   * Every public route, read from the router instead of written out: it knows the pages, because
   * they are its files. Without the filter the 404 catch-all would be among them, and an agent
   * would be offered a path with a placeholder in it.
   */
  const routes = router
    .getRoutes()
    .map(route => route.path)
    .filter(path => !path.includes(':') && !path.includes('*'))
    .sort()

  /*
   * Unregisters the tools when the app is taken down, the way the specification intends it: the
   * signal is the only handle for that. Without it a torn-down page would leave its tools behind
   * in the browser's model context.
   */
  const controller = new AbortController()
  nuxtApp.vueApp.onUnmount(() => controller.abort())

  registerWebMcpTools(
    webMcpTools({
      routes,
      navigate: async path => {
        await router.push(path)
        // The path the router actually ended up on, not the one asked for: a redirect would
        // otherwise be reported as a page that was never opened.
        return router.currentRoute.value.path
      },
    }),
    controller.signal,
  )
})
