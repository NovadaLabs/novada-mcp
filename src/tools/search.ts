import { fetchWithRetry, USER_AGENT, cleanParams } from "../utils/index.js";
import { SCRAPER_API_BASE } from "../config.js";
import type { SearchParams, NovadaApiResponse, NovadaSearchResult } from "./types.js";
import { getSearchEngineError } from "./types.js";

export async function novadaSearch(params: SearchParams, apiKey: string): Promise<string> {
  const requestedEngine = params.engine || "google";

  // Try the requested engine; if it fails and isn't Google, auto-fallback to Google
  const { results, engine: actualEngine, fallbackNote } = await executeSearchWithFallback(
    params, requestedEngine, apiKey
  );

  if (results.length === 0) {
    return `No results found for this query${fallbackNote ? ` (${fallbackNote})` : ""}.`;
  }

  // Active filters summary for agent metadata
  const activeFilters: string[] = [];
  if (params.country) activeFilters.push(`country:${params.country}`);
  if (params.time_range) activeFilters.push(`time:${params.time_range}`);
  if (params.start_date || params.end_date) {
    activeFilters.push(`dates:${params.start_date || "*"}→${params.end_date || "*"}`);
  }
  if (params.include_domains?.length) activeFilters.push(`only:${params.include_domains.join(",")}`);
  if (params.exclude_domains?.length) activeFilters.push(`exclude:${params.exclude_domains.join(",")}`);

  const filterStr = activeFilters.length ? ` | ${activeFilters.join(" | ")}` : "";

  const lines: string[] = [
    `## Search Results`,
    `results:${results.length} | engine:${actualEngine}${fallbackNote ? ` (${fallbackNote})` : ""}${filterStr}`,
    ``,
    `---`,
    ``,
  ];

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    let url = r.url || r.link || "N/A";
    url = unwrapBingUrl(url);

    // Strip pagination UI text from snippets
    const rawSnippet = r.description || r.snippet || "";
    const cleanSnippet = rawSnippet
      .replace(/\.{3}\s*Read\s+more\s*$/i, "...")
      .replace(/\s+Read\s+more\s*$/i, "")
      .replace(/\s+More\s*$/i, "")
      .trim() || "No description";

    lines.push(`### ${i + 1}. ${r.title || "Untitled"}`);
    lines.push(`url: ${url}`);
    lines.push(`snippet: ${cleanSnippet}`);
    if (r.published || r.date) lines.push(`published: ${r.published || r.date}`);
    lines.push("");
  }

  lines.push(`---`);
  lines.push(`## Agent Hints`);
  lines.push(`- To read any result in full: \`novada_extract\` with its url`);
  lines.push(`- To batch-read multiple results: \`novada_extract\` with \`url=[url1, url2, ...]\``);
  lines.push(`- For deeper multi-source research: \`novada_research\``);
  if (fallbackNote) {
    lines.push(`- Requested engine '${requestedEngine}' was unavailable — results from Google.`);
  }
  if (results.length < 3) {
    lines.push(`- Few results returned. Broaden the query or increase \`num\` for more coverage.`);
  }

  return lines.join("\n");
}

/** Execute search with auto-fallback: if requested engine fails, retry with Google */
async function executeSearchWithFallback(
  params: SearchParams,
  engine: string,
  apiKey: string
): Promise<{ results: NovadaSearchResult[]; engine: string; fallbackNote: string }> {
  const result = await executeSearch(params, engine, apiKey);

  // If the requested engine returned results, use them
  if (result.results.length > 0) {
    return { results: result.results, engine, fallbackNote: "" };
  }

  // If already Google, nothing to fall back to
  if (engine === "google") {
    return { results: [], engine, fallbackNote: "" };
  }

  // Auto-fallback: try Google
  const fallback = await executeSearch(params, "google", apiKey);
  if (fallback.results.length > 0) {
    return {
      results: fallback.results,
      engine: "google",
      fallbackNote: `${engine} unavailable, fell back to google`,
    };
  }

  return { results: [], engine, fallbackNote: `${engine} and google both returned no results` };
}

/** Execute a single search call against one engine */
async function executeSearch(
  params: SearchParams,
  engine: string,
  apiKey: string
): Promise<{ results: NovadaSearchResult[]; error?: string }> {
  const rawParams: Record<string, string> = {
    q: params.query,
    api_key: apiKey,
    engine,
    num: String(params.num || 10),
    country: params.country || "",
    language: params.language || "",
  };

  if (engine === "bing") {
    if (!rawParams.country) rawParams.country = "us";
    if (!rawParams.language) rawParams.language = "en";
    rawParams.mkt = `${rawParams.language}-${rawParams.country.toUpperCase()}`;
  }

  if (params.time_range) rawParams.time_range = params.time_range;
  if (params.start_date) rawParams.start_date = params.start_date;
  if (params.end_date) rawParams.end_date = params.end_date;
  if (params.include_domains?.length) rawParams.include_domains = params.include_domains.slice(0, 10).join(",");
  if (params.exclude_domains?.length) rawParams.exclude_domains = params.exclude_domains.slice(0, 10).join(",");

  const cleaned = cleanParams(rawParams) as Record<string, string>;
  const searchParams = new URLSearchParams(cleaned);

  try {
    const response = await fetchWithRetry(
      `${SCRAPER_API_BASE}/search?${searchParams.toString()}`,
      {
        headers: {
          "User-Agent": USER_AGENT,
          Origin: "https://www.novada.com",
          Referer: "https://www.novada.com/",
        },
      }
    );

    const data: NovadaApiResponse = response.data;
    if (data.code && data.code !== 200 && data.code !== 0) {
      return { results: [], error: `code ${data.code}: ${data.msg}` };
    }

    return { results: data.data?.organic_results || data.organic_results || [] };
  } catch (err) {
    return { results: [], error: err instanceof Error ? err.message : String(err) };
  }
}

/** Unwrap Bing redirect/base64 encoded URLs */
function unwrapBingUrl(url: string): string {
  if (url.includes("bing.com/ck/a") || url.includes("r.bing.com")) {
    try {
      const u = new URL(url);
      const realUrl = u.searchParams.get("r") || u.searchParams.get("u");
      if (realUrl) {
        const cleaned = realUrl.replace(/^a1/, "");
        try {
          const decoded = Buffer.from(cleaned, "base64").toString("utf8");
          if (decoded.startsWith("http")) return decoded;
        } catch { /* not base64 */ }
        return decodeURIComponent(cleaned);
      }
    } catch { /* keep original */ }
  }
  if (!url.startsWith("http") && /^[A-Za-z0-9+/=]+$/.test(url) && url.length > 20) {
    try {
      const decoded = Buffer.from(url, "base64").toString("utf8");
      if (decoded.startsWith("http")) return decoded;
    } catch { /* keep original */ }
  }
  return url;
}
