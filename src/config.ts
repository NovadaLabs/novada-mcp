export const VERSION = "0.8.1";

// Scraper API — platform scraper endpoint (POST /request with Bearer token auth).
// Only /request is live. /search (SERP) returns 404 — pending backend deployment.
export const SCRAPER_API_BASE = "https://scraper.novada.com";

// Web Unblocker — JS-rendered pages, POST /request with Bearer token auth.
// Response: { code: 0, data: { code: 200, html: "...", use_balance: N } }
export const WEB_UNBLOCKER_BASE = "https://webunlocker.novada.com";

// Optional: Browser API WebSocket endpoint (CDP)
// Format: wss://username:password@upg-scbr2.novada.com
export const BROWSER_WS_ENDPOINT = process.env.NOVADA_BROWSER_WS;

// Optional: Proxy credentials
export const PROXY_USER = process.env.NOVADA_PROXY_USER;
export const PROXY_PASS = process.env.NOVADA_PROXY_PASS;
export const PROXY_ENDPOINT = process.env.NOVADA_PROXY_ENDPOINT;

// JS-heavy detection: content shorter than this triggers render escalation
export const JS_DETECTION_THRESHOLD = 200;

// Timeout configuration (milliseconds)
export const TIMEOUTS = {
  STATIC_FETCH: 30000,
  PROXY_FETCH: 45000,
  RENDER: 60000,
  BROWSER_CONNECT: 10000,
  BROWSER_PAGE: 30000,
  SITEMAP: 8000,
  CRAWL_STATIC: 15000,
  CRAWL_RENDER: 60000,
} as const;

// Excel max sheet name length
export const EXCEL_MAX_SHEET_NAME = 31;
