/** Tool parameter interfaces */

export interface SearchParams {
  query: string;
  engine?: "google" | "bing" | "duckduckgo" | "yahoo" | "yandex";
  num?: number;
  country?: string;
  language?: string;
}

export interface ExtractParams {
  url: string;
  format?: "text" | "markdown" | "html";
}

export interface CrawlParams {
  url: string;
  max_pages?: number;
  strategy?: "bfs" | "dfs";
}

export interface ResearchParams {
  question: string;
  depth?: "quick" | "deep";
}

/** Novada API response types */

export interface NovadaSearchResult {
  title?: string;
  url?: string;
  link?: string;
  description?: string;
  snippet?: string;
}

export interface NovadaApiResponse {
  code?: number;
  msg?: string;
  data?: { organic_results?: NovadaSearchResult[] };
  organic_results?: NovadaSearchResult[];
}

/** Runtime validation — replaces `as unknown as XParams` double casts */

export function validateSearchParams(args: Record<string, unknown> | undefined): SearchParams {
  if (!args || typeof args.query !== "string" || !args.query) {
    throw new Error("'query' (string) is required for novada_search");
  }
  return args as unknown as SearchParams;
}

export function validateExtractParams(args: Record<string, unknown> | undefined): ExtractParams {
  if (!args || typeof args.url !== "string" || !args.url) {
    throw new Error("'url' (string) is required for novada_extract");
  }
  return args as unknown as ExtractParams;
}

export function validateCrawlParams(args: Record<string, unknown> | undefined): CrawlParams {
  if (!args || typeof args.url !== "string" || !args.url) {
    throw new Error("'url' (string) is required for novada_crawl");
  }
  return args as unknown as CrawlParams;
}

export function validateResearchParams(args: Record<string, unknown> | undefined): ResearchParams {
  if (!args || typeof args.question !== "string" || !args.question) {
    throw new Error("'question' (string) is required for novada_research");
  }
  return args as unknown as ResearchParams;
}
