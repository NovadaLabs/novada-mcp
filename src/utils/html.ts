import * as cheerio from "cheerio";

/** Elements to completely remove before content extraction */
const REMOVE_TAGS = [
  "script", "style", "noscript", "svg", "iframe", "nav", "footer",
  "header", "aside", "form",
];

/** CSS selectors for boilerplate regions to remove */
const BOILERPLATE_SELECTORS = [
  "[class*='sidebar']", "[id*='sidebar']",
  "[class*='menu']", "[id*='menu']",
  "[class*='cookie']", "[id*='cookie']",
  "[class*='banner']", "[id*='banner']",
  "[class*='popup']", "[id*='popup']",
  "[class*='modal']", "[id*='modal']",
  "[class*='ad-']", "[class*='advertisement']",
  "[class*='footer']", "[id*='footer']",
  "[class*='header']", "[id*='header']",
  "[role='navigation']", "[role='banner']", "[role='contentinfo']",
];

/** Content area selectors in priority order */
const CONTENT_SELECTORS = [
  "main",
  "article",
  "[role='main']",
  "[class*='content']",
  "[class*='article']",
  "[class*='post']",
  "[class*='entry']",
  "[id*='content']",
  "[id*='article']",
];

/**
 * Extract main content from HTML using cheerio.
 * Tries semantic selectors first, falls back to boilerplate removal.
 */
export function extractMainContent(html: string): string {
  if (!html || !html.trim()) return "";

  const $ = cheerio.load(html);

  // Remove non-content elements
  for (const tag of REMOVE_TAGS) {
    $(tag).remove();
  }

  // Remove comments
  $("*").contents().filter(function () {
    return this.type === "comment";
  }).remove();

  // Try semantic content selectors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let $content: any = null;
  for (const selector of CONTENT_SELECTORS) {
    const $el = $(selector).first();
    if ($el.length && ($el.text() || "").trim().length > 200) {
      $content = $el;
      break;
    }
  }

  // Fallback: use body with boilerplate removed
  if (!$content) {
    for (const selector of BOILERPLATE_SELECTORS) {
      $(selector).remove();
    }
    $content = $("body");
  }

  if (!$content || !$content.length) return "";

  // Convert to markdown-like text
  const lines: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Exclude td/th — tables handled separately below to avoid duplication
  $content.find("h1, h2, h3, h4, h5, h6, p, li, blockquote, pre, dt, dd").filter((_: number, el: any) => {
    // Skip elements inside tables to prevent duplicate content
    return $(el).parents("table").length === 0 || ["dt", "dd"].includes((el.tagName || "").toLowerCase());
  }).each((_: number, el: any) => {
    const $el = $(el);
    const tag = (el.tagName || "").toLowerCase();
    const text = $el.text().replace(/\s+/g, " ").trim();
    if (!text) return;

    if (tag.match(/^h[1-6]$/)) {
      const level = parseInt(tag[1]);
      lines.push(`\n${"#".repeat(level)} ${text}\n`);
    } else if (tag === "li") {
      lines.push(`- ${text}`);
    } else if (tag === "blockquote") {
      lines.push(`> ${text}`);
    } else if (tag === "pre") {
      lines.push(`\`\`\`\n${text}\n\`\`\``);
    } else {
      lines.push(text);
    }
  });

  // Handle tables as markdown tables
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $content.find("table").each((_: number, table: any) => {
    const $table = $(table);
    const rows: string[][] = [];
    $table.find("tr").each((_, tr) => {
      const cells: string[] = [];
      $(tr).find("th, td").each((__, cell) => {
        cells.push($(cell).text().replace(/\s+/g, " ").trim());
      });
      if (cells.length) rows.push(cells);
    });
    if (rows.length) {
      const header = `| ${rows[0].join(" | ")} |`;
      const separator = `| ${rows[0].map(() => "---").join(" | ")} |`;
      const body = rows.slice(1).map(r => `| ${r.join(" | ")} |`).join("\n");
      lines.push(`\n${header}\n${separator}\n${body}\n`);
    }
  });

  const result = lines.join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return result.slice(0, 30000);
}

/** Extract page title from HTML */
export function extractTitle(html: string): string {
  if (!html) return "Untitled";
  const $ = cheerio.load(html);
  return $("title").first().text().trim() || $("h1").first().text().trim() || "Untitled";
}

/** Extract meta description from HTML */
export function extractDescription(html: string): string {
  if (!html) return "";
  const $ = cheerio.load(html);
  return (
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    ""
  ).trim();
}

/** Content quality signals returned to help agents judge response quality */
export interface ContentQuality {
  /** Detected language from <html lang> or <meta> — empty if unknown */
  lang: string;
  /** True if content is suspiciously short (<500 chars of main content) */
  isThin: boolean;
  /** True if the page looks like a CAPTCHA, block page, or login wall */
  isBlocked: boolean;
  /** Human-readable warnings for the agent (empty array = no issues) */
  warnings: string[];
}

/** Detect content quality issues BEFORE returning to the agent */
export function assessContentQuality(html: string, mainContentLength: number): ContentQuality {
  if (!html) return { lang: "", isThin: true, isBlocked: false, warnings: ["Empty response"] };

  const $ = cheerio.load(html);
  const warnings: string[] = [];

  // Detect language from <html lang="..."> or <meta http-equiv="content-language">
  const htmlLang = ($("html").attr("lang") || "").split("-")[0].toLowerCase();
  const metaLang = ($('meta[http-equiv="content-language"]').attr("content") || "").split("-")[0].toLowerCase();
  const lang = htmlLang || metaLang || "";

  // Warn if content appears to be in a non-English locale (when no language was requested)
  if (lang && lang !== "en" && lang !== "") {
    warnings.push(`Content language detected: '${lang}' — may be a geo-redirected page`);
  }

  // Thin content detection
  const isThin = mainContentLength < 500;
  if (isThin) {
    warnings.push(`Very short content (${mainContentLength} chars) — page may be blocked, gated, or JS-rendered`);
  }

  // Block/CAPTCHA detection
  const lower = html.toLowerCase();
  const isBlocked =
    lower.includes("access denied") ||
    lower.includes("403 forbidden") ||
    (lower.includes("cloudflare") && lower.includes("ray id")) ||
    lower.includes("captcha") ||
    lower.includes("bot detected") ||
    lower.includes("automated access") ||
    lower.includes("checking your browser");

  if (isBlocked) {
    warnings.push("Page appears to be a CAPTCHA or bot-block page, not real content");
  }

  return { lang, isThin, isBlocked, warnings };
}

/** Resolve a single href to an absolute URL */
function resolveHref(href: string, baseUrl?: string): string | null {
  if (href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:")) return null;
  if (href.startsWith("//")) return `https:${href}`;
  if (baseUrl && !href.startsWith("http")) {
    try { return new URL(href, baseUrl).href; }
    catch { return null; }
  }
  return href.startsWith("http") ? href : null;
}

/**
 * Extract all meaningful links from HTML.
 * Navigation links (from <nav>, <header>) are returned first for better site mapping.
 */
export function extractLinks(html: string, baseUrl?: string): string[] {
  if (!html) return [];
  const $ = cheerio.load(html);
  const navLinks: string[] = [];
  const bodyLinks: string[] = [];
  const seen = new Set<string>();

  // Priority 1: Navigation and header links (site structure)
  $("nav a[href], header a[href], [role='navigation'] a[href]").each((_, el) => {
    const url = resolveHref($(el).attr("href") || "", baseUrl);
    if (url && !seen.has(url)) {
      seen.add(url);
      navLinks.push(url);
    }
  });

  // Priority 2: All other links
  $("a[href]").each((_, el) => {
    const url = resolveHref($(el).attr("href") || "", baseUrl);
    if (url && !seen.has(url)) {
      seen.add(url);
      bodyLinks.push(url);
    }
  });

  return [...navLinks, ...bodyLinks].slice(0, 50);
}
