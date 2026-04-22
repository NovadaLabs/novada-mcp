import { fetchViaProxy, extractMainContent, extractTitle, extractDescription, extractLinks, assessContentQuality } from "../utils/index.js";
import type { ExtractParams } from "./types.js";

export async function novadaExtract(params: ExtractParams, apiKey?: string): Promise<string> {
  // Batch mode: array of URLs
  if (Array.isArray(params.url)) {
    const urls = params.url;
    const results = await Promise.all(
      urls.map((url, i) =>
        extractSingle({ ...params, url }, apiKey)
          .then(content => ({ i, url, content, ok: true }))
          .catch(err => ({ i, url, content: `Error: ${err instanceof Error ? err.message : String(err)}`, ok: false }))
      )
    );

    const successful = results.filter(r => r.ok).length;
    const failed = results.length - successful;

    const lines: string[] = [
      `## Batch Extract Results`,
      `urls:${urls.length} | successful:${successful} | failed:${failed}`,
      ``,
      `---`,
      ``,
    ];

    for (const r of results) {
      lines.push(`### [${r.i + 1}/${urls.length}] ${r.url}`);
      if (!r.ok) lines.push(`status: FAILED`);
      lines.push(``);
      lines.push(r.content);
      lines.push(``);
      lines.push(`---`);
      lines.push(``);
    }

    lines.push(`## Agent Hints`);
    if (failed > 0) {
      lines.push(`- ${failed} URL(s) failed. Check if they require JavaScript rendering.`);
    }
    lines.push(`- Use novada_map to discover additional pages on any of these domains.`);

    return lines.join("\n");
  }

  // Single URL mode
  return extractSingle(params as ExtractParams & { url: string }, apiKey);
}

async function extractSingle(
  params: ExtractParams & { url: string },
  apiKey?: string
): Promise<string> {
  const response = await fetchViaProxy(params.url, apiKey);
  const html: string = response.data;

  if (typeof html !== "string") {
    throw new Error("Response is not HTML. The URL may return JSON or binary data.");
  }

  const title = extractTitle(html);
  const description = extractDescription(html);

  if (params.format === "html") {
    if (html.length <= 10000) return html;
    const truncated = html.slice(0, 10000);
    const lastTagClose = truncated.lastIndexOf(">");
    return (lastTagClose > 9000 ? truncated.slice(0, lastTagClose + 1) : truncated) +
      "\n<!-- Content truncated at 10,000 characters -->";
  }

  const mainContent = extractMainContent(html);

  // Filter links: top 15 same-domain content links only (reduces token waste)
  const allLinks = extractLinks(html, params.url);
  let baseDomain: string;
  try {
    baseDomain = new URL(params.url).hostname.replace(/^www\./, "");
  } catch {
    baseDomain = "";
  }
  const sameDomainLinks = allLinks
    .filter(link => {
      try {
        return new URL(link).hostname.replace(/^www\./, "") === baseDomain;
      } catch { return false; }
    })
    .slice(0, 15);

  if (params.format === "text") {
    const plainContent = mainContent
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^\- /gm, "  * ")
      .replace(/\*\*([^*]+)\*\*/g, "$1");
    const linksText = sameDomainLinks.length > 0
      ? `\nSame-domain links:\n${sameDomainLinks.map(l => `  ${l}`).join("\n")}`
      : "";
    return `${title}\n${description ? description + "\n" : ""}\n${plainContent}${linksText}`;
  }

  // Markdown output (default)
  const contentLen = mainContent.length;
  const isTruncated = contentLen >= 30000;

  // Content quality assessment — detect language, thin content, blocks
  const quality = assessContentQuality(html, contentLen);
  const qualityFlags = quality.warnings.length > 0
    ? ` | WARNING: ${quality.warnings.join("; ")}`
    : "";

  const lines: string[] = [
    `## Extracted Content`,
    `url: ${params.url}`,
    `title: ${title}`,
    ...(description ? [`description: ${description}`] : []),
    `format: ${params.format || "markdown"} | chars:${contentLen}${isTruncated ? ` (truncated at 30,000 — full page larger)` : ""} | links:${allLinks.length}${qualityFlags}`,
    ``,
    `---`,
    ``,
    mainContent,
  ];

  if (sameDomainLinks.length > 0) {
    lines.push(``, `---`, `## Same-Domain Links (${sameDomainLinks.length} of ${allLinks.length})`);
    for (const link of sameDomainLinks) {
      lines.push(`- ${link}`);
    }
  }

  // Dynamic Agent Hints — context-specific, not generic
  lines.push(``, `---`, `## Agent Hints`);

  if (quality.isBlocked) {
    lines.push(`- This page appears to be a CAPTCHA or block page. Use \`novada_research\` to find the same information from other sources.`);
  } else if (quality.isThin) {
    lines.push(`- Very short content (${contentLen} chars). The page may be JS-rendered, geo-redirected, or login-gated.`);
    if (quality.lang && quality.lang !== "en") {
      lines.push(`- Content language: '${quality.lang}' — this may be a geo-redirect. Try a different source or use \`novada_research\` instead.`);
    }
  } else if (isTruncated) {
    lines.push(`- Content truncated at 30,000 chars. Use \`novada_crawl\` with max_pages=1 to get complete content.`);
  }

  if (!quality.isThin && !quality.isBlocked) {
    lines.push(`- To read full text: content above is ${contentLen > 5000 ? "comprehensive" : "a summary"} (${contentLen} chars).`);
  }

  try {
    lines.push(`- More pages on this domain: \`novada_map\` with url="${new URL(params.url).origin}"`);
  } catch { /* ignore URL parse error */ }
  if (params.query) {
    lines.push(`- Query context: "${params.query}". Focus analysis on this topic.`);
  }

  return lines.join("\n");
}
