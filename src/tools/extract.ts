import { fetchWithRetry, extractMainContent, extractTitle, extractDescription, isContentLink } from "../utils/index.js";
import type { ExtractParams } from "./types.js";

export async function novadaExtract(params: ExtractParams): Promise<string> {
  const response = await fetchWithRetry(params.url);
  const html: string = response.data;

  if (typeof html !== "string") {
    throw new Error("Response is not HTML. The URL may return JSON or binary data.");
  }

  const title = extractTitle(html);
  const description = extractDescription(html);

  if (params.format === "html") {
    return html.slice(0, 10000);
  }

  const mainContent = extractMainContent(html);

  // Extract meaningful links only
  const linkMatches = html.matchAll(/href=["'](https?:\/\/[^"'#]+)["']/gi);
  const allLinks = [...linkMatches].map((m) => m[1]);
  const meaningfulLinks = [
    ...new Set(allLinks.filter((href) => isContentLink(href))),
  ].slice(0, 20);

  // Plain text output
  if (params.format === "text") {
    const plainContent = mainContent
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^\- /gm, "  * ")
      .replace(/\*\*([^*]+)\*\*/g, "$1");
    const linksText = meaningfulLinks.length > 0
      ? `\nLinks:\n${meaningfulLinks.map((l) => `  ${l}`).join("\n")}`
      : "";
    return `${title}\n${description ? description + "\n" : ""}\n${plainContent}${linksText}`;
  }

  // Markdown output (default)
  return [
    `# ${title}`,
    description ? `\n> ${description}` : "",
    `\n## Content\n\n${mainContent}`,
    meaningfulLinks.length > 0
      ? `\n## Links (${meaningfulLinks.length})\n\n${meaningfulLinks.map((l) => `- ${l}`).join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
