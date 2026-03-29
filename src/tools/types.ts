/** Tool parameter interfaces — typed instead of `as any` */

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
