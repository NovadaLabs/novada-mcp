import { fetchWithRetry, extractMainContent, extractTitle, normalizeUrl, isContentLink } from "../utils/index.js";
import type { CrawlParams } from "./types.js";

export async function novadaCrawl(params: CrawlParams): Promise<string> {
  const maxPages = Math.min(params.max_pages || 5, 20);
  const visited = new Set<string>();
  const queue: { url: string; depth: number }[] = [
    { url: params.url, depth: 0 },
  ];
  const results: {
    url: string;
    title: string;
    text: string;
    depth: number;
    wordCount: number;
  }[] = [];
  const baseHostname = new URL(params.url).hostname.replace(/^www\./, "");

  while (queue.length > 0 && results.length < maxPages) {
    const item = params.strategy === "dfs" ? queue.pop()! : queue.shift()!;

    const normalizedUrl = normalizeUrl(item.url);
    if (visited.has(normalizedUrl)) continue;
    visited.add(normalizedUrl);

    try {
      const response = await fetchWithRetry(item.url, { timeout: 15000, maxRedirects: 3 });
      const html = response.data;
      if (typeof html !== "string") continue;

      const title = extractTitle(html);
      const text = extractMainContent(html).slice(0, 3000);
      const wordCount = text.split(/\s+/).filter(Boolean).length;

      // Skip near-empty pages
      if (wordCount < 20) continue;

      results.push({ url: item.url, title, text, depth: item.depth, wordCount });

      // Discover same-domain content links
      const linkMatches = html.matchAll(/href=["'](https?:\/\/[^"'#]+)["']/gi);
      for (const match of linkMatches) {
        try {
          const linkUrl = new URL(match[1]);
          const linkHostname = linkUrl.hostname.replace(/^www\./, "");
          const normalizedLink = normalizeUrl(linkUrl.href);
          if (
            linkHostname === baseHostname &&
            !visited.has(normalizedLink) &&
            isContentLink(linkUrl.href)
          ) {
            queue.push({ url: linkUrl.href, depth: item.depth + 1 });
          }
        } catch {
          // Invalid URL, skip
        }
      }
    } catch {
      // Failed to fetch, skip this page
    }
  }

  if (results.length === 0) {
    return `Failed to crawl ${params.url}. The site may be unreachable or blocking automated access.`;
  }

  const totalWords = results.reduce((sum, r) => sum + r.wordCount, 0);
  const stoppedEarly = results.length < maxPages;
  const stopReason = stoppedEarly
    ? queue.length === 0
      ? "No more same-domain links to follow."
      : "Remaining links were filtered (assets, auth pages, or already visited)."
    : "";

  return [
    `# Crawl Results for ${params.url}`,
    `\nPages crawled: ${results.length}/${maxPages} | Strategy: ${params.strategy || "bfs"} | Total words: ${totalWords}`,
    stoppedEarly ? `\n*Stopped early: ${stopReason}*\n` : "\n",
    ...results.map(
      (r) =>
        `## ${r.title}\n**URL:** ${r.url} | **Depth:** ${r.depth} | **Words:** ${r.wordCount}\n\n${r.text}\n`
    ),
  ].join("\n");
}
