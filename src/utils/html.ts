/** Extract main content using a readability-like approach */
export function extractMainContent(html: string): string {
  // Remove non-content elements
  let cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Try to find main content area (order: main > article > content div)
  const contentSelectors = [
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*(?:class|id)=["'][^"']*(?:content|article|post|entry|main|body)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  ];

  let mainContent = "";
  for (const selector of contentSelectors) {
    const match = cleaned.match(selector);
    if (match && match[1] && match[1].length > 200) {
      mainContent = match[1];
      break;
    }
  }

  // Fallback: remove boilerplate regions
  if (!mainContent) {
    mainContent = cleaned
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
      .replace(/<div[^>]*(?:class|id)=["'][^"']*(?:sidebar|menu|nav|footer|header|cookie|banner|popup|modal|ad-|advertisement)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, "");
  }

  // Convert HTML structure to markdown-like text
  mainContent = mainContent
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, text) => {
      const prefix = "#".repeat(parseInt(level));
      return `\n${prefix} ${stripTags(text).trim()}\n`;
    })
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, text) => `- ${stripTags(text).trim()}\n`)
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, text) => `\n${stripTags(text).trim()}\n`)
    .replace(/<br\s*\/?>/gi, "\n");

  // Final cleanup
  mainContent = stripTags(mainContent)
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  return mainContent.slice(0, 8000);
}

/** Strip all HTML tags from a string */
function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ");
}

/** Extract page title from HTML */
export function extractTitle(html: string): string {
  return html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || "Untitled";
}

/** Extract meta description from HTML */
export function extractDescription(html: string): string {
  return html.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
  )?.[1] || "";
}
