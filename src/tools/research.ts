import { fetchWithRetry, USER_AGENT, normalizeUrl } from "../utils/index.js";
import { SCRAPER_API_BASE } from "../config.js";
import type { ResearchParams, NovadaApiResponse, NovadaSearchResult } from "./types.js";

export async function novadaResearch(params: ResearchParams, apiKey: string): Promise<string> {
  // Resolve depth — 'auto' picks based on question complexity heuristic
  const resolvedDepth = resolveDepth(params.depth || "auto", params.question);
  const isDeep = resolvedDepth === "deep" || resolvedDepth === "comprehensive";
  const isComprehensive = resolvedDepth === "comprehensive";

  const queries = generateSearchQueries(params.question, isDeep, isComprehensive, params.focus);

  // Execute all searches in parallel
  const allResults = await Promise.all(
    queries.map(async (query): Promise<{ query: string; results: NovadaSearchResult[]; failed?: boolean }> => {
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

        const data: NovadaApiResponse = response.data;
        const results: NovadaSearchResult[] = data.data?.organic_results || data.organic_results || [];
        return { query, results };
      } catch {
        return { query, results: [], failed: true };
      }
    })
  );

  const failedCount = allResults.filter(r => r.failed).length;
  const totalResults = allResults.reduce((sum, r) => sum + r.results.length, 0);
  const uniqueSources = new Map<string, { title: string; url: string; snippet: string }>();

  for (const { results } of allResults) {
    for (const r of results) {
      const rawUrl: string = r.url || r.link || "";
      const normalized = normalizeUrl(rawUrl);
      if (normalized && !uniqueSources.has(normalized)) {
        const rawSnippet = r.description || r.snippet || "";
        const cleanSnippet = rawSnippet
          .replace(/\.{3}\s*Read\s+more\s*$/i, "...")
          .replace(/\s+Read\s+more\s*$/i, "")
          .trim();
        uniqueSources.set(normalized, {
          title: r.title || "Untitled",
          url: rawUrl,
          snippet: cleanSnippet,
        });
      }
    }
  }

  // --- Relevance filtering: score each source against the question keywords ---
  const questionWords = params.question.toLowerCase().split(/\s+/);
  const questionKeywords = questionWords.filter(w => !STOP_WORDS.has(w) && w.length > 2);

  const allSources = [...uniqueSources.values()];
  const scored = allSources.map(s => ({
    ...s,
    relevance: scoreRelevance(s, questionKeywords),
  }));

  // Sort by relevance, keep sources above 20% keyword match (at least 1 keyword)
  scored.sort((a, b) => b.relevance - a.relevance);
  const relevant = scored.filter(s => s.relevance >= 0.2);
  const dropped = scored.length - relevant.length;
  const sources = relevant.slice(0, 15);

  const depthLabel = params.depth === "auto"
    ? `${resolvedDepth} (auto-selected)`
    : resolvedDepth;

  const relevanceNote = dropped > 0
    ? ` | filtered:${sources.length}/${scored.length} (${dropped} off-topic sources removed)`
    : "";

  const lines: string[] = [
    `## Research Report`,
    `question: "${params.question}"`,
    `depth:${depthLabel} | searches:${queries.length}${failedCount > 0 ? ` (${failedCount} failed)` : ""} | results:${totalResults} | unique_sources:${sources.length}${relevanceNote}`,
    params.focus ? `focus: ${params.focus}` : "",
    ``,
    `---`,
    ``,
    `## Search Queries Used`,
    ``,
    ...queries.map((q, i) => `${i + 1}. ${q}`),
    ``,
    `## Key Findings`,
    ``,
    ...sources.map((s, i) =>
      `${i + 1}. **${s.title}**\n   ${s.url}\n   ${s.snippet}\n`
    ),
    `## Sources`,
    ``,
    ...sources.map((s, i) => `${i + 1}. [${s.title}](${s.url})`),
    ``,
    `---`,
    `## Agent Hints`,
    `- ${sources.length} relevant sources found${dropped > 0 ? ` (${dropped} off-topic removed)` : ""}. Extract the most relevant with: \`novada_extract\` with url=[url1, url2]`,
  ];

  if (sources.length < 5) {
    lines.push(`- Few relevant sources found. Try adding \`focus\` param (e.g. focus="${questionKeywords.slice(0, 3).join(" ")}") to improve precision.`);
  }
  if (resolvedDepth === "quick") {
    lines.push(`- For more coverage: use depth='deep' (5-6 searches) or depth='comprehensive' (8-10 searches).`);
  }
  if (failedCount > 0) {
    lines.push(`- ${failedCount} search(es) failed. Results may be incomplete — retry or increase depth.`);
  }

  return lines.filter(l => l !== "").join("\n");
}

/** Resolve 'auto' and 'comprehensive' depth to the actual search strategy */
function resolveDepth(depth: string, question: string): string {
  if (depth === "auto") {
    const isComplex = question.length > 80
      || /\b(compare|versus|vs|why|how does|best|worst|difference between|trade-off|pros and cons|review)\b/i.test(question);
    return isComplex ? "deep" : "quick";
  }
  return depth; // quick, deep, comprehensive pass through
}

const STOP_WORDS = new Set([
  "what", "how", "why", "when", "where", "who", "which", "is", "are", "do",
  "does", "the", "a", "an", "in", "on", "at", "to", "for", "of", "with",
  "and", "or", "but", "can", "will", "should", "would", "could",
]);

/**
 * Generate diverse search queries anchored to the original question.
 *
 * Key design: every sub-query starts with `anchor` (first ~5 meaningful words
 * of the original question) so that domain-ambiguous terms like "production"
 * or "building" stay in context. Previous version extracted isolated keywords
 * which caused "production AI agents" → construction results.
 */
function generateSearchQueries(
  question: string,
  deep: boolean,
  comprehensive: boolean,
  focus?: string
): string[] {
  const queries: string[] = [question];
  const topic = question.replace(/[?!.]+$/, "").trim();

  // Anchor = first 5 significant words of the question, preserving word order
  // This keeps compound terms like "AI agents" or "production deployment" intact
  const words = topic.toLowerCase().split(/\s+/);
  const significantWords = words.filter(w => !STOP_WORDS.has(w) && w.length > 2);
  const anchor = significantWords.slice(0, 5).join(" ") || topic;

  const focusSuffix = focus ? ` ${focus}` : "";

  // All sub-queries are anchored to the topic — never just keyword fragments
  queries.push(`${anchor} overview guide${focusSuffix}`);
  queries.push(`${anchor} vs alternatives comparison${focusSuffix}`);

  if (deep || comprehensive) {
    queries.push(`${anchor} best practices${focusSuffix}`);
    queries.push(`${anchor} challenges limitations${focusSuffix}`);
    // Use quoted anchor for community search to force topic coherence
    const quotedAnchor = significantWords.length >= 2
      ? `"${significantWords.slice(0, 3).join(" ")}"`
      : `"${topic}"`;
    queries.push(`${quotedAnchor} site:reddit.com OR site:news.ycombinator.com`);
  }

  if (comprehensive) {
    queries.push(`${anchor} case study examples${focusSuffix}`);
    queries.push(`${anchor} 2024 2025 trends${focusSuffix}`);
    queries.push(`${anchor} expert opinion analysis${focusSuffix}`);
  }

  return queries;
}

/**
 * Score how relevant a source is to the original question.
 * Returns 0.0–1.0 based on keyword overlap between the source title+snippet
 * and the question's significant words.
 */
function scoreRelevance(source: { title: string; snippet: string }, questionKeywords: string[]): number {
  if (questionKeywords.length === 0) return 1;
  const text = `${source.title} ${source.snippet}`.toLowerCase();
  const matches = questionKeywords.filter(kw => text.includes(kw));
  return matches.length / questionKeywords.length;
}
