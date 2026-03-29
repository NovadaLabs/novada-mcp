import { fetchWithRetry, USER_AGENT, normalizeUrl } from "../utils/index.js";
import { SCRAPER_API_BASE } from "../config.js";
import type { ResearchParams } from "./types.js";

export async function novadaResearch(params: ResearchParams, apiKey: string): Promise<string> {
  if (params.question.length < 5) {
    throw new Error("Research question must be at least 5 characters long.");
  }

  const isDeep = params.depth === "deep";
  const queries = generateSearchQueries(params.question, isDeep);

  // Execute all searches in parallel
  const allResults = await Promise.all(
    queries.map(async (query): Promise<{ query: string; results: any[] }> => {
      try {
        const searchParams = new URLSearchParams({
          q: query,
          api_key: apiKey,
          engine: "google",
          num: "5",
        });

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

        const data = response.data;
        const results = data.data?.organic_results || data.organic_results || [];
        return { query, results };
      } catch {
        return { query, results: [] };
      }
    })
  );

  // Deduplicate sources by normalized URL
  const totalResults = allResults.reduce((sum, r) => sum + r.results.length, 0);
  const uniqueSources = new Map<string, { title: string; url: string; snippet: string }>();

  for (const { results } of allResults) {
    for (const r of results) {
      const rawUrl: string = r.url || r.link || "";
      const normalized = normalizeUrl(rawUrl);
      if (normalized && !uniqueSources.has(normalized)) {
        uniqueSources.set(normalized, {
          title: r.title || "Untitled",
          url: rawUrl,
          snippet: r.description || r.snippet || "",
        });
      }
    }
  }

  const sources = [...uniqueSources.values()].slice(0, 15);

  return [
    `# Research Report: ${params.question}`,
    `\n**Depth:** ${params.depth || "quick"} | **Searches:** ${queries.length} | **Results found:** ${totalResults} | **Unique sources:** ${sources.length}\n`,
    `## Search Queries Used\n`,
    ...queries.map((q, i) => `${i + 1}. ${q}`),
    `\n## Key Findings\n`,
    ...sources.map(
      (s, i) =>
        `${i + 1}. **${s.title}**\n   ${s.url}\n   ${s.snippet}\n`
    ),
    `\n## Sources\n`,
    ...sources.map((s, i) => `${i + 1}. [${s.title}](${s.url})`),
    `\n---\n*Research conducted via Novada API. For deeper analysis, extract individual sources using novada_extract.*`,
  ].join("\n");
}

const STOP_WORDS = new Set([
  "what", "how", "why", "when", "where", "who", "which", "is", "are", "do",
  "does", "the", "a", "an", "in", "on", "at", "to", "for", "of", "with",
  "and", "or", "but", "can", "will", "should", "would", "could",
]);

/** Generate diverse search queries for broader research coverage */
function generateSearchQueries(question: string, deep: boolean): string[] {
  const queries: string[] = [question];
  const words = question.toLowerCase().split(/\s+/);
  const topic = question.replace(/[?!.]+$/, "").trim();
  const keywords = words.filter((w) => !STOP_WORDS.has(w) && w.length > 2);
  const keyPhrase = keywords.slice(0, 4).join(" ");

  if (words.length > 3) {
    queries.push(`${keyPhrase} overview explained`);
    queries.push(`${keyPhrase} vs alternatives comparison`);
    if (deep) {
      queries.push(`${keyPhrase} best practices real world`);
      queries.push(`${keyPhrase} challenges limitations`);
      queries.push(`"${keywords[0]}" "${keywords[1] || keywords[0]}" site:reddit.com OR site:news.ycombinator.com`);
    }
  } else {
    queries.push(`"${topic}" explained overview`);
    queries.push(`${topic} vs alternatives`);
    if (deep) {
      queries.push(`${topic} examples use cases`);
      queries.push(`${topic} review experience`);
      queries.push(`${topic} site:reddit.com OR site:news.ycombinator.com`);
    }
  }

  return queries;
}
