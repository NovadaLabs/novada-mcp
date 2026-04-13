import { fetchViaProxy, extractLinks, normalizeUrl, isContentLink } from "../utils/index.js";
import type { MapParams } from "./types.js";

/**
 * Map a website to discover all URLs on the site.
 * BFS crawl that only collects links without extracting content.
 * Uses path-diverse queuing: limits URLs per path prefix to ensure
 * the map covers the full site structure, not just one deep section.
 */
export async function novadaMap(params: MapParams, apiKey?: string): Promise<string> {
  const maxUrls = Math.min(params.limit || 50, 100);
  const maxDepth = Math.min(params.max_depth ?? 2, 5);
  const visited = new Set<string>();
  const discovered = new Set<string>();
  const queue: { url: string; depth: number }[] = [{ url: params.url, depth: 0 }];
  const baseHostname = new URL(params.url).hostname.replace(/^www\./, "");

  // Track how many URLs discovered per top-level path prefix
  const prefixCounts = new Map<string, number>();
  const MAX_PER_PREFIX = Math.max(3, Math.floor(maxUrls / 5));

  discovered.add(normalizeUrl(params.url));

  while (queue.length > 0 && discovered.size < maxUrls) {
    const item = queue.shift()!;
    const { url, depth } = item;
    const normalized = normalizeUrl(url);
    if (visited.has(normalized)) continue;
    visited.add(normalized);

    // Respect max_depth
    if (depth >= maxDepth) continue;

    try {
      const response = await fetchViaProxy(url, apiKey, { timeout: 10000 });
      if (typeof response.data !== "string") continue;

      const links = extractLinks(response.data, url);
      for (const link of links) {
        if (discovered.size >= maxUrls) break;
        try {
          const linkUrl = new URL(link);
          const linkHostname = linkUrl.hostname.replace(/^www\./, "");
          const isSameDomain = linkHostname === baseHostname;
          const isSubdomain = linkHostname.endsWith(`.${baseHostname}`);

          if ((isSameDomain || (params.include_subdomains && isSubdomain)) && isContentLink(link)) {
            const normalizedLink = normalizeUrl(link);
            if (!discovered.has(normalizedLink) && !visited.has(normalizedLink)) {
              const pathParts = linkUrl.pathname.split("/").filter(Boolean);
              const prefix = pathParts.length > 0 ? `/${pathParts[0]}` : "/";
              const count = prefixCounts.get(prefix) || 0;

              if (count < MAX_PER_PREFIX) {
                prefixCounts.set(prefix, count + 1);
                discovered.add(normalizedLink);
                queue.push({ url: link, depth: depth + 1 });
              }
            }
          }
        } catch { /* invalid URL */ }
      }
    } catch { /* failed to fetch, skip */ }
  }

  const urls = [...discovered];

  // Filter by search term if provided
  let filtered = urls;
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = urls.filter(u => u.toLowerCase().includes(searchLower));
  }

  // SPA detection: if only root URL found with no filter active
  if (filtered.length <= 1 && !params.search) {
    const isSpaLikely = filtered.length === 0 || (filtered.length === 1 && filtered[0] === normalizeUrl(params.url));
    if (isSpaLikely) {
      const hint = [
        `## Site Map`,
        `root: ${params.url}`,
        `urls:${filtered.length}`,
        ``,
        `---`,
        ``,
        `⚠ Only ${filtered.length === 0 ? "0 URLs" : "the root URL"} found. This site is likely a JavaScript SPA.`,
        `Static crawling cannot discover JS-rendered links.`,
        ``,
        `## Agent Hints`,
        `- Try \`novada_extract\` on ${params.url} to get the page content directly.`,
        `- If content is dynamically loaded, the extract may also be limited.`,
        `- Use \`novada_search\` with \`site:${new URL(params.url).hostname}\` to find indexed subpages.`,
      ].join("\n");
      return hint;
    }
  }

  if (filtered.length === 0) {
    return `No URLs found on ${params.url}${params.search ? ` matching "${params.search}"` : ""}.`;
  }

  const lines: string[] = [
    `## Site Map`,
    `root: ${params.url}`,
    `urls:${filtered.length}${params.search ? ` (filtered by "${params.search}" from ${urls.length} total)` : ""}`,
    ``,
    `---`,
    ``,
    ...filtered.map((u, i) => `${i + 1}. ${u}`),
    ``,
    `---`,
    `## Agent Hints`,
    `- Use \`novada_extract\` to read any of these pages.`,
    `- Use \`novada_extract\` with url=[url1,url2,...] for batch extraction.`,
    `- Use \`novada_crawl\` to extract content from multiple pages at once.`,
  ];

  if (params.search) {
    lines.push(`- Remove 'search' param to see all ${urls.length} discovered URLs.`);
  }

  return lines.join("\n");
}
