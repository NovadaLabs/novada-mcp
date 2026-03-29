import { fetchWithRetry, USER_AGENT } from "../utils/index.js";
import { SCRAPER_API_BASE } from "../config.js";
import type { SearchParams, NovadaApiResponse, NovadaSearchResult } from "./types.js";

export async function novadaSearch(params: SearchParams, apiKey: string): Promise<string> {
  const engine = params.engine || "google";
  const searchParams = new URLSearchParams({
    q: params.query,
    api_key: apiKey,
    engine,
    num: String(params.num || 10),
  });

  // Bing: force English locale to avoid irrelevant localized results
  if (engine === "bing") {
    searchParams.set("country", params.country || "us");
    searchParams.set("language", params.language || "en");
    searchParams.set(
      "mkt",
      params.language
        ? `${params.language}-${(params.country || "us").toUpperCase()}`
        : "en-US"
    );
  } else {
    if (params.country) searchParams.set("country", params.country);
    if (params.language) searchParams.set("language", params.language);
  }

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
    throw new Error(
      `Novada API error (code ${data.code}): ${data.msg || "Unknown error"}`
    );
  }

  const results: NovadaSearchResult[] = data.data?.organic_results || data.organic_results || [];
  if (results.length === 0) {
    return "No results found for this query.";
  }

  return results
    .map((r: NovadaSearchResult, i: number) => {
      let url: string = r.url || r.link || "N/A";
      url = unwrapBingUrl(url);
      return `${i + 1}. **${r.title || "Untitled"}**\n   URL: ${url}\n   ${r.description || r.snippet || "No description"}`;
    })
    .join("\n\n");
}

/** Unwrap Bing redirect/base64 encoded URLs */
function unwrapBingUrl(url: string): string {
  // Bing redirect wrapper
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
  // Raw base64-encoded URL
  if (!url.startsWith("http") && /^[A-Za-z0-9+/=]+$/.test(url) && url.length > 20) {
    try {
      const decoded = Buffer.from(url, "base64").toString("utf8");
      if (decoded.startsWith("http")) return decoded;
    } catch { /* keep original */ }
  }
  return url;
}
