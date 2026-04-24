/**
 * Request-scoped credentials store using Node.js AsyncLocalStorage.
 *
 * Solves the SDK multi-client issue: instead of mutating process.env (global state),
 * the SDK wraps each call in withCredentials(). Tool utilities read from this store
 * first, falling back to process.env for MCP server use (single-tenant).
 */
import { AsyncLocalStorage } from "node:async_hooks";

export interface ToolCredentials {
  webUnblockerKey?: string;
  browserWs?: string;
  proxyUser?: string;
  proxyPass?: string;
  proxyEndpoint?: string;
}

const store = new AsyncLocalStorage<ToolCredentials>();

/**
 * Run a function with specific credentials in scope.
 * Used by NovadaClient SDK to isolate credentials per-request.
 */
export function withCredentials<T>(creds: ToolCredentials, fn: () => T): T {
  return store.run(creds, fn);
}

/** Active web unblocker key: SDK-scoped > NOVADA_WEB_UNBLOCKER_KEY env var. */
export function getWebUnblockerKey(): string | undefined {
  return store.getStore()?.webUnblockerKey ?? process.env.NOVADA_WEB_UNBLOCKER_KEY;
}

/** Active browser WebSocket endpoint: SDK-scoped > NOVADA_BROWSER_WS env var. */
export function getBrowserWs(): string | undefined {
  return store.getStore()?.browserWs ?? process.env.NOVADA_BROWSER_WS;
}

/** Active proxy credentials: SDK-scoped > NOVADA_PROXY_* env vars. */
export function getProxyCredentials(): { user: string; pass: string; endpoint: string } | null {
  const scoped = store.getStore();
  const user = scoped?.proxyUser ?? process.env.NOVADA_PROXY_USER;
  const pass = scoped?.proxyPass ?? process.env.NOVADA_PROXY_PASS;
  const endpoint = scoped?.proxyEndpoint ?? process.env.NOVADA_PROXY_ENDPOINT;
  if (user && pass && endpoint) return { user, pass, endpoint };
  return null;
}
