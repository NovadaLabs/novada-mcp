import { z } from "zod";

// ─── URL Safety ─────────────────────────────────────────────────────────────

/** Only allow HTTP/HTTPS URLs — block file://, ftp://, gopher://, internal IPs */
const BLOCKED_HOSTS = /^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.\d+\.\d+|0\.0\.0\.0|\[::1\])$/i;

const safeUrl = z.string()
  .url("A valid URL is required")
  .refine(
    (url) => /^https?:\/\//i.test(url),
    "Only HTTP and HTTPS URLs are supported"
  )
  .refine(
    (url) => {
      try { return !BLOCKED_HOSTS.test(new URL(url).hostname); }
      catch { return false; }
    },
    "URLs pointing to localhost or private network ranges are not allowed"
  );

// ─── Zod Schemas ────────────────────────────────────────────────────────────

export const SearchParamsSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  engine: z.enum(["google", "bing", "duckduckgo", "yahoo", "yandex"]).default("google"),
  num: z.number().int().min(1).max(20).default(10),
  country: z.string().default(""),
  language: z.string().default(""),
  time_range: z.enum(["day", "week", "month", "year"]).optional()
    .describe("Limit results to a time window. 'day'=last 24h, 'week'=last 7 days, 'month'=last 30 days, 'year'=last 12 months."),
  start_date: z.string().optional()
    .describe("ISO date YYYY-MM-DD. Return results published on or after this date."),
  end_date: z.string().optional()
    .describe("ISO date YYYY-MM-DD. Return results published on or before this date."),
  include_domains: z.array(z.string()).optional()
    .describe("Only return results from these domains. E.g. ['github.com', 'arxiv.org']. Max 10."),
  exclude_domains: z.array(z.string()).optional()
    .describe("Exclude results from these domains. E.g. ['reddit.com', 'quora.com']. Max 10."),
});

export const ExtractParamsSchema = z.object({
  url: z.union([
    safeUrl,
    z.array(safeUrl).min(1).max(10),
  ]).describe("URL or array of URLs (max 10) to extract. Batch mode processes in parallel."),
  format: z.enum(["text", "markdown", "html"]).default("markdown"),
  query: z.string().optional()
    .describe("Optional query for relevance context. Helps the calling agent focus on relevant sections."),
});

export const CrawlParamsSchema = z.object({
  url: safeUrl,
  max_pages: z.number().int().min(1).max(20).default(5),
  strategy: z.enum(["bfs", "dfs"]).default("bfs"),
  instructions: z.string().optional()
    .describe("Natural language hint for which pages to prioritize. E.g. 'only API reference pages', 'skip blog and changelog'. Applied as path-level filtering; semantic filtering is agent-side."),
  select_paths: z.array(z.string()).optional()
    .describe("Regex patterns to restrict crawled URL paths. E.g. ['/docs/.*', '/api/.*']."),
  exclude_paths: z.array(z.string()).optional()
    .describe("Regex patterns for URL paths to skip entirely. E.g. ['/blog/.*', '/changelog/.*']."),
});

export const ResearchParamsSchema = z.object({
  question: z.string().min(5, "Research question must be at least 5 characters"),
  depth: z.enum(["quick", "deep", "auto", "comprehensive"]).default("auto")
    .describe("'quick'=3 searches, 'deep'=5-6, 'comprehensive'=8-10, 'auto'=server decides based on question complexity."),
  focus: z.string().optional()
    .describe("Optional focus area to guide sub-query generation. E.g. 'technical implementation', 'business impact', 'recent news only'."),
});

export const MapParamsSchema = z.object({
  url: safeUrl,
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  include_subdomains: z.boolean().default(false),
  max_depth: z.number().int().min(1).max(5).default(2)
    .describe("Link-hops from root to follow. Default 2. Higher = more pages found but slower."),
});

// ─── Inferred Types ─────────────────────────────────────────────────────────

export type SearchParams = z.infer<typeof SearchParamsSchema>;
export type ExtractParams = z.infer<typeof ExtractParamsSchema>;
export type CrawlParams = z.infer<typeof CrawlParamsSchema>;
export type ResearchParams = z.infer<typeof ResearchParamsSchema>;
export type MapParams = z.infer<typeof MapParamsSchema>;

// ─── Validation Functions ───────────────────────────────────────────────────

export function validateSearchParams(args: Record<string, unknown> | undefined): SearchParams {
  return SearchParamsSchema.parse(args ?? {});
}

export function validateExtractParams(args: Record<string, unknown> | undefined): ExtractParams {
  return ExtractParamsSchema.parse(args ?? {});
}

export function validateCrawlParams(args: Record<string, unknown> | undefined): CrawlParams {
  return CrawlParamsSchema.parse(args ?? {});
}

export function validateResearchParams(args: Record<string, unknown> | undefined): ResearchParams {
  return ResearchParamsSchema.parse(args ?? {});
}

export function validateMapParams(args: Record<string, unknown> | undefined): MapParams {
  return MapParamsSchema.parse(args ?? {});
}

// ─── API Response Types ─────────────────────────────────────────────────────

export interface NovadaSearchResult {
  title?: string;
  url?: string;
  link?: string;
  description?: string;
  snippet?: string;
  published?: string;
  date?: string;
}

export interface NovadaApiResponse {
  code?: number;
  msg?: string;
  data?: { organic_results?: NovadaSearchResult[] };
  organic_results?: NovadaSearchResult[];
}

// ─── Structured Error Types ─────────────────────────────────────────────────

export enum NovadaErrorCode {
  INVALID_API_KEY = "INVALID_API_KEY",
  RATE_LIMITED = "RATE_LIMITED",
  URL_UNREACHABLE = "URL_UNREACHABLE",
  API_DOWN = "API_DOWN",
  INVALID_PARAMS = "INVALID_PARAMS",
  UNKNOWN = "UNKNOWN",
}

export interface NovadaError {
  code: NovadaErrorCode;
  message: string;
  retryable: boolean;
  docsUrl?: string;
}

const DOCS_BASE = "https://www.novada.com";

/** Strip API keys and sensitive URL params from any string */
function sanitizeMessage(msg: string): string {
  return msg
    .replace(/api_key=[^&\s"')]+/gi, "api_key=***")
    .replace(/https?:\/\/scraperapi\.novada\.com[^\s"')]+/gi, "[novada-api-url]");
}

/** Map known search engine failure patterns to actionable messages */
export function getSearchEngineError(engine: string, errorMsg: string): string | null {
  const msg = errorMsg.toLowerCase();

  // Yahoo: URL builder drops q param → 410
  if (engine === "yahoo" && (msg.includes("410") || msg.includes("empty query"))) {
    return (
      `Yahoo search failed (backend drops the query parameter — known bug).\n` +
      `→ Switch engine: use engine='google' for the same query.\n` +
      `→ For research questions, novada_research is more reliable than novada_search.`
    );
  }

  // Yandex: no API key provisioned
  if (engine === "yandex" && (msg.includes("invalid_api_key") || msg.includes("api_key"))) {
    return (
      `Yandex search unavailable (no Yandex Search API key provisioned).\n` +
      `→ Switch engine: use engine='google' or engine='bing'.\n` +
      `→ Google is the most reliable engine for this API.`
    );
  }

  // Bing: query string silently dropped
  if (engine === "bing" && msg.includes("no results")) {
    return (
      `Bing search returned no results (known issue: query string may be dropped by backend).\n` +
      `→ Switch engine: use engine='google' for the same query.\n` +
      `→ Or use novada_research which uses Google internally and is more reliable.`
    );
  }

  // DuckDuckGo: workers down
  if (engine === "duckduckgo" && (msg.includes("api_down") || msg.includes("down"))) {
    return (
      `DuckDuckGo unavailable (workers down at Novada backend).\n` +
      `→ Switch engine: use engine='google' for the same query.\n` +
      `→ novada_research is a better choice for research questions.`
    );
  }

  // Google: WorkerPool 413 from parallel calls
  if (engine === "google" && (msg.includes("413") || msg.includes("workerpool"))) {
    return (
      `Google search temporarily unavailable (WorkerPool 413 — parallel call overload).\n` +
      `→ Retry this call once — sequential calls succeed.\n` +
      `→ Or use novada_research which runs Google searches sequentially and avoids this limit.`
    );
  }

  return null;
}

export function classifyError(error: unknown, engine?: string): NovadaError {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    // Search engine-specific errors — return actionable message if matched
    if (engine) {
      const engineError = getSearchEngineError(engine, error.message);
      if (engineError) {
        return {
          code: NovadaErrorCode.UNKNOWN,
          message: engineError,
          retryable: false,
        };
      }
    }

    if (msg.includes("401") || msg.includes("api_key") || msg.includes("unauthorized")) {
      return {
        code: NovadaErrorCode.INVALID_API_KEY,
        message: `Invalid or missing API key. Get one at ${DOCS_BASE}\n→ Set NOVADA_API_KEY in your MCP config.`,
        retryable: false,
        docsUrl: DOCS_BASE,
      };
    }
    if (msg.includes("429") || msg.includes("rate") || msg.includes("limit")) {
      return {
        code: NovadaErrorCode.RATE_LIMITED,
        message: "Rate limit exceeded.\n→ Wait 5–10 seconds and retry.\n→ For search, use novada_research which is more conservative with API calls.",
        retryable: true,
        docsUrl: DOCS_BASE,
      };
    }
    if (msg.includes("timeout") || msg.includes("econnrefused") || msg.includes("enotfound")) {
      return {
        code: NovadaErrorCode.URL_UNREACHABLE,
        message: `URL unreachable: ${sanitizeMessage(error.message)}\n→ Check the URL is valid and publicly accessible.\n→ If this is a bot-protected site, NOVADA_UNBLOCKER_KEY enables AI CAPTCHA bypass.`,
        retryable: true,
      };
    }
    if (msg.includes("503") || msg.includes("502")) {
      return {
        code: NovadaErrorCode.API_DOWN,
        message: "Novada API is temporarily unavailable.\n→ Retry in 10–30 seconds.\n→ If the issue persists, check https://www.novada.com for status.",
        retryable: true,
      };
    }
  }
  const rawMsg = error instanceof Error ? error.message : String(error);
  return {
    code: NovadaErrorCode.UNKNOWN,
    message: sanitizeMessage(rawMsg),
    retryable: false,
  };
}
