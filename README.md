# Novada MCP

[![npm version](https://img.shields.io/npm/v/novada-mcp)](https://www.npmjs.com/package/novada-mcp)
[![npm downloads](https://img.shields.io/npm/dm/novada-mcp)](https://www.npmjs.com/package/novada-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

23-tool MCP server: web search, extraction, scraping (129 platforms), proxy, and browser automation.

Works with Claude, Cursor, VS Code, Windsurf, and any MCP-compatible client.

---

## Install

**Claude Code:**
```bash
claude mcp add novada -e NOVADA_API_KEY=your_key -- npx -y novada-mcp
```

**Claude Desktop / Cursor / VS Code / Windsurf** — add to your MCP config:
```json
{
  "mcpServers": {
    "novada": {
      "command": "npx",
      "args": ["-y", "novada-mcp"],
      "env": { "NOVADA_API_KEY": "your_key" }
    }
  }
}
```

Get your key at [novada.com](https://www.novada.com).

---

## Health Check

```bash
NOVADA_API_KEY=your_key npx novada-mcp health
```

Or call `novada_health` from any MCP client to verify which products are active on your key.

---

## Tool Selection

```
Have a question or topic, no URL → novada_search
Have a URL to read              → novada_extract
Read an entire site (docs, wiki) → novada_crawl
Discover all URLs on a site     → novada_map
Multi-source research report    → novada_research
Structured data (Amazon, TikTok, LinkedIn, …) → novada_scrape
Verify a factual claim          → novada_verify
JS-heavy / bot-blocked raw HTML → novada_unblock
Login, click, fill forms        → novada_browser
Proxy credentials for your own requests → novada_proxy_*
```

---

## Tools

### Search & Content

#### `novada_search`
Web search via Google, Bing, DuckDuckGo, Yandex. Returns ranked titles + URLs + snippets.

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `query` | ✓ | — | Search query |
| `engine` | | `google` | `google` `bing` `duckduckgo` `yandex` |
| `num` | | `10` | 1–20 results |
| `time_range` | | — | `day` `week` `month` `year` |
| `country` | | — | ISO country code |
| `include_domains` | | — | Restrict to these domains (max 10) |
| `exclude_domains` | | — | Exclude these domains (max 10) |
| `extract_options` | | — | Auto-extract top-N URLs (saves a separate `novada_extract` call) |

```
novada_search({query: "Claude MCP 2025", engine: "google", num: 5})
novada_search({query: "AI news", time_range: "week", include_domains: ["techcrunch.com"]})
```

---

#### `novada_extract`
Extract clean content from any URL. Batch up to 10 URLs. Auto-escalates static → JS render.

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `url` | ✓ | — | Single URL or array of up to 10 URLs |
| `render` | | `auto` | `auto` `static` `render` `browser` |
| `format` | | `markdown` | `markdown` `text` `html` |
| `fields` | | — | Extract specific fields: `["price", "author", "rating"]` |
| `max_chars` | | 25000 | Max content length (max 100000) |

```
novada_extract({url: "https://docs.example.com/api"})
novada_extract({url: ["https://a.com", "https://b.com"], format: "markdown"})
novada_extract({url: "https://shop.com/product", fields: ["price", "availability"]})
```

---

#### `novada_crawl`
Crawl a site BFS/DFS up to 20 pages, extract content from each.

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `url` | ✓ | — | Starting URL |
| `max_pages` | | `5` | 1–20 |
| `strategy` | | `bfs` | `bfs` (breadth-first) or `dfs` (depth-first) |
| `select_paths` | | — | Regex patterns to include: `["/docs/.*"]` |
| `exclude_paths` | | — | Regex patterns to skip: `["/blog/.*"]` |
| `render` | | `auto` | `auto` `static` `render` |
| `instructions` | | — | Natural-language hint: `"only API reference pages"` |

```
novada_crawl({url: "https://docs.example.com", max_pages: 10, select_paths: ["/docs/.*"]})
novada_crawl({url: "https://example.com", instructions: "only quickstart and API pages"})
```

---

#### `novada_map`
Discover all URLs on a site (sitemap.xml + BFS fallback). Fast. Doesn't read content.

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `url` | ✓ | — | Root URL |
| `limit` | | `50` | Max URLs to return |
| `max_depth` | | `2` | Link hops from root |
| `search` | | — | Filter URLs matching this term |

```
novada_map({url: "https://example.com", limit: 100})
novada_map({url: "https://docs.example.com", search: "api"})
```

---

#### `novada_research`
Multi-source research: generates 3–10 parallel queries, deduplicates, extracts top sources, returns cited report.

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `question` | ✓ | — | Research question (min 5 chars) |
| `depth` | | `auto` | `quick`=3 queries, `deep`=5–6, `comprehensive`=8–10 |
| `focus` | | — | Scope hint: `"technical implementation"` `"recent news only"` |

```
novada_research({question: "How do MCP servers work with Claude?", depth: "deep"})
novada_research({question: "Best proxy providers 2025", focus: "pricing and reliability"})
```

---

#### `novada_verify`
Verify a factual claim against live web sources. Returns verdict + confidence score.

Verdicts: `supported` / `unsupported` / `contested` / `insufficient_data`

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `claim` | ✓ | — | Claim to verify (min 10 chars) |
| `context` | | — | `"as of 2024"` `"in the US"` |

```
novada_verify({claim: "OpenAI released GPT-5 in 2025"})
novada_verify({claim: "The Eiffel Tower is 330m tall", context: "as of 2024"})
```

---

### Scraping (13 Active Platforms)

#### `novada_scrape`
Structured data from 13 active platforms. Synchronous — returns results immediately.

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `platform` | ✓ | — | Exact domain: `amazon.com` `tiktok.com` `linkedin.com` |
| `operation` | ✓ | — | Operation ID (see table below) |
| `params` | ✓ | `{}` | Operation-specific params |
| `format` | | `markdown` | `markdown` `json` `toon` |
| `limit` | | `20` | Max records returned |

**Active platforms and operations:**

| Platform | Operation ID | Required Params |
|----------|-------------|-----------------|
| `amazon.com` | `amazon_product_keywords` | `{ keyword }` |
| `amazon.com` | `amazon_product_asin` | `{ asin }` |
| `amazon.com` | `amazon_product_url` | `{ url }` |
| `amazon.com` | `amazon_comment_url` | `{ url }` |
| `walmart.com` | `walmart_product_keywords` | `{ keyword }` |
| `walmart.com` | `walmart_product_url` | `{ url }` |
| `google.com` | `google_search` | `{ q }` |
| `google.com` | `google_shopping_keywords` | `{ keyword }` |
| `bing.com` | `bing_search` | `{ keyword }` |
| `duckduckgo.com` | `duckduckgo` | `{ keyword }` |
| `yandex.com` | `yandex` | `{ keyword }` |
| `x.com` | `twitter_profile_username` | `{ username }` |
| `x.com` | `twitter_post_posturl` | `{ url }` |
| `tiktok.com` | `tiktok_posts_url` | `{ url }` |
| `tiktok.com` | `tiktok_profiles_url` | `{ url }` |
| `instagram.com` | `ins_profiles_username` | `{ username }` |
| `instagram.com` | `ins_posts_profileurl` | `{ url }` |
| `instagram.com` | `ins_comment_posturl` | `{ url }` |
| `facebook.com` | `facebook_post_posts-url` | `{ url }` |
| `facebook.com` | `facebook_profile_profiles-url` | `{ url }` |
| `youtube.com` | `youtube_video_search_label` | `{ label }` |
| `youtube.com` | `youtube_video-url` | `{ url }` |
| `youtube.com` | `youtube_comment_id` | `{ video_id }` |
| `linkedin.com` | `linkedin_company_information_url` | `{ url }` |
| `linkedin.com` | `linkedin_job_listings_information_keyword` | `{ keyword }` |
| `github.com` | `github_repository_repo-url` | `{ url }` |
| `github.com` | `github_repository_search-url` | `{ url }` |

> **NOT AVAILABLE** (return error 11006 — use `novada_extract` instead):
> reddit.com, glassdoor.com, zillow.com, ebay.com, etsy.com, tripadvisor.com, and ~100 others.

For the full platform+operation list: call `novada_scrape` and read the `novada://scraper-platforms` resource.

```
novada_scrape({platform: "amazon.com", operation: "amazon_product_keywords", params: {keyword: "iphone 16"}})
novada_scrape({platform: "linkedin.com", operation: "linkedin_company_information_url", params: {url: "https://linkedin.com/company/openai"}})
novada_scrape({platform: "github.com", operation: "github_repository_repo-url", params: {url: "https://github.com/anthropics/anthropic-sdk-python"}})
```

---

#### Async Scraping (`novada_scraper_submit` / `novada_scraper_status` / `novada_scraper_result`)

For long-running or batch scrape jobs. Use when `novada_scrape` times out.

```
1. task_id = novada_scraper_submit({platform: "amazon.com", operation: "amazon_product_asin", params: {asin: "B09..."}})
2. Poll: novada_scraper_status({task_id})  ← every 5–10s until status = "complete"
3. novada_scraper_result({task_id, format: "json"})
```

---

#### `novada_unblock`
Raw HTML from bot-protected or JS-heavy pages when you need the DOM.

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `url` | ✓ | — | Target URL |
| `method` | | `render` | `render` or `browser` |
| `country` | | — | Route through this country |
| `wait_for` | | — | CSS selector to wait for |

```
novada_unblock({url: "https://example.com/protected", method: "render"})
```

---

### Proxy

All proxy tools return connection credentials (not proxied content). Use these in your own HTTP client.

| Tool | Best for |
|------|---------|
| `novada_proxy_residential` | Anti-bot bypass, geo-targeting (100M+ IPs) |
| `novada_proxy_isp` | Social media, e-commerce (looks like real home user) |
| `novada_proxy_mobile` | Mobile-targeted content, app APIs |
| `novada_proxy_datacenter` | High-volume scraping of unprotected targets (fastest) |
| `novada_proxy_static` | Account management, login-dependent workflows (sticky IP) |
| `novada_proxy_dedicated` | Clean reputation, exclusive IP |
| `novada_proxy` | Generic (choose type via param) |

Common params: `country` (ISO code), `session_id` (sticky session), `format` (`url`/`env`/`curl`).

```
novada_proxy_residential({country: "us", format: "curl"})
novada_proxy_static({country: "de", session_id: "acct42", format: "env"})
```

---

### Browser Automation

Requires `NOVADA_BROWSER_WS` env var (Browser API WebSocket).

#### `novada_browser`
Interactive cloud browser — navigate, click, type, screenshot, eval JS.

```
novada_browser({
  actions: [
    {action: "navigate", url: "https://example.com"},
    {action: "click", selector: "#login"},
    {action: "type", selector: "input[name=email]", text: "user@example.com"},
    {action: "screenshot"}
  ]
})
```

#### `novada_browser_flow`
Declarative multi-step flows with scroll, wait, and conditional steps.

---

### Health & Discovery

| Tool | Use when |
|------|---------|
| `novada_health` | A tool is failing — check which products are active on your key |
| `novada_health_all` | Full endpoint health + latency for all services in parallel |
| `novada_discover` | Need the full tool catalog with categories and availability |

---

## Error Reference

| Code | Meaning | Fix |
|------|---------|-----|
| `11006` | Invalid operation ID, or Scraper API not activated | Verify op ID against table above. If correct, activate at dashboard.novada.com |
| `11008` | Unknown platform name | Use exact domain (`amazon.com`, not `amazon`) |
| `27202` | Task still pending | Normal — poll again in 5s |
| `27203` | Server-side task failure | Transient — retry once |
| `10001` | Missing required params | Check `params` object for the operation |

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NOVADA_API_KEY` | **Yes** | Scraper API key (search + 129 platforms + web unblocker) |
| `NOVADA_BROWSER_WS` | Optional | Browser API WebSocket → enables `novada_browser` tools |
| `NOVADA_PROXY_USER` | Optional | Proxy username → enables `novada_proxy_*` tools |
| `NOVADA_PROXY_PASS` | Optional | Proxy password |
| `NOVADA_PROXY_ENDPOINT` | Optional | Proxy host:port |

---

## Load Only What You Need

Set `NOVADA_GROUPS` to limit which tool groups are registered (reduces token overhead in tool-heavy contexts):

```json
{ "NOVADA_GROUPS": "search,extract,research" }
```

Valid groups: `search` `extract` `crawl` `map` `research` `scrape` `proxy` `verify` `unblock` `browser` `health` `discover` `scraper_submit` `scraper_status` `scraper_result` `proxy_residential` `proxy_isp` `proxy_datacenter` `proxy_mobile` `proxy_static` `proxy_dedicated` `browser_flow`

---

## Common Workflows

**Find and read pages on a topic:**
```
novada_search({query: "..."}) → novada_extract({url: [top URLs]})
```

**Deep research on a question:**
```
novada_research({question: "...", depth: "deep"})
```

**Scrape Amazon products then read reviews:**
```
novada_scrape({platform: "amazon.com", operation: "amazon_product_keywords", params: {keyword: "..."}})
→ novada_scrape({platform: "amazon.com", operation: "amazon_comment_url", params: {url: product_url}})
```

**Crawl a docs site:**
```
novada_map({url: "https://docs.example.com"})   ← find URLs
→ novada_crawl({url: "...", select_paths: ["/docs/.*"], max_pages: 20})
```

**Get LinkedIn company info + job listings:**
```
novada_scrape({platform: "linkedin.com", operation: "linkedin_company_information_url", params: {url: "..."}})
novada_scrape({platform: "linkedin.com", operation: "linkedin_job_listings_information_keyword", params: {keyword: "..."}})
```

---

## CLI

```bash
NOVADA_API_KEY=your_key npx novada-mcp search "GPT-5 release" --engine google --num 5
NOVADA_API_KEY=your_key npx novada-mcp extract https://example.com --format markdown
NOVADA_API_KEY=your_key npx novada-mcp research "AI agent frameworks 2025" --depth deep
NOVADA_API_KEY=your_key npx novada-mcp scrape --platform amazon.com --operation amazon_product_keywords --keyword "iphone 16"
NOVADA_API_KEY=your_key npx novada-mcp health
```

---

## Links

- API key + docs: [novada.com](https://www.novada.com)
- Issues: [github.com/NovadaLabs/novada-mcp/issues](https://github.com/NovadaLabs/novada-mcp/issues)
- Enterprise: [sales@novada.com](mailto:sales@novada.com)
