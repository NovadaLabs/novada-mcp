# Novada MCP

[![npm version](https://img.shields.io/npm/v/novada-mcp)](https://www.npmjs.com/package/novada-mcp)
[![npm downloads](https://img.shields.io/npm/dm/novada-mcp)](https://www.npmjs.com/package/novada-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

One MCP server for all Novada products — web search, content extraction, scraping, proxy, and browser automation.

Works with Claude, Cursor, VS Code, Windsurf, and any MCP-compatible client.

---

## Quick Start

**Claude Code:**
```bash
claude mcp add novada -e NOVADA_API_KEY=your_key -- npx -y novada-mcp
```

**Claude Desktop** — add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "novada": {
      "command": "npx",
      "args": ["-y", "novada-mcp"],
      "env": {
        "NOVADA_API_KEY": "your_key"
      }
    }
  }
}
```

**Cursor / VS Code / Windsurf** — add to your MCP settings:
```json
{
  "novada": {
    "command": "npx",
    "args": ["-y", "novada-mcp"],
    "env": { "NOVADA_API_KEY": "your_key" }
  }
}
```

Get your API key at [novada.com](https://www.novada.com).

---

## Auto-Setup (懒人启动)

Let an AI agent configure everything automatically — it opens your Chrome, reads your Novada dashboard, extracts your credentials, and writes the MCP config.

**Requirements:** Claude Code + Chrome DevTools MCP + Chrome logged into [dashboard.novada.com](https://dashboard.novada.com)

See [`prompts/lazy-start/setup-agent.md`](prompts/lazy-start/setup-agent.md) for the full prompt (English + 中文).

---

## Health Check

Verify which products are active on your key:

```bash
# CLI
NOVADA_API_KEY=your_key npx novada-mcp health

# MCP tool
novada_health
```

---

## Tools

### Search & Content

| Tool | What it does |
|------|-------------|
| `novada_search` | Web search via Google, Bing, DuckDuckGo, Yandex — returns ranked results with titles, URLs, snippets |
| `novada_extract` | Extract clean content from any URL; batch up to 10 URLs; auto-escalates from static → JS render |
| `novada_crawl` | Crawl a site BFS/DFS up to 20 pages, extract content from each |
| `novada_research` | Multi-source research — parallel queries, deduplication, cited report |
| `novada_map` | Discover all URLs on a site (sitemap.xml + BFS fallback) |
| `novada_verify` | Verify a factual claim against live web sources — supported / unsupported / contested |

### Scraping (129 Platforms)

| Tool | What it does |
|------|-------------|
| `novada_scrape` | Structured data from Amazon, Reddit, LinkedIn, TikTok, GitHub, Glassdoor, Zillow, and 120+ more |
| `novada_scraper_submit` | Submit async scrape task — returns `task_id` |
| `novada_scraper_status` | Poll task status (pending / running / complete / failed) |
| `novada_scraper_result` | Retrieve completed result by `task_id` |
| `novada_unblock` | Force JS render on blocked / SPA pages — returns raw HTML |

### Proxy

| Tool | What it does |
|------|-------------|
| `novada_proxy_residential` | 100M+ residential IPs — strongest anti-bot bypass, geo-target by country/city |
| `novada_proxy_isp` | ISP-assigned IPs that look like real home users — best for social media and e-commerce |
| `novada_proxy_mobile` | 4G/5G mobile IPs — for mobile-targeted content and app APIs |
| `novada_proxy_datacenter` | Datacenter IPs — fastest, lowest cost for high-volume non-protected targets |
| `novada_proxy_static` | Dedicated static ISP IP — for account management and login-dependent workflows |
| `novada_proxy_dedicated` | Exclusive datacenter IP — clean reputation, zero contamination |
| `novada_proxy` | Generic proxy credentials (residential / ISP / datacenter / mobile) |

### Browser Automation

| Tool | What it does |
|------|-------------|
| `novada_browser` | Cloud browser — navigate, click, type, screenshot, JS eval; maintains session state |
| `novada_browser_flow` | Multi-step browser flows — click, scroll, wait, type, screenshot sequences |

### Health & Discovery

| Tool | What it does |
|------|-------------|
| `novada_health` | Check which products are active on your API key |
| `novada_health_all` | Full health check — all endpoints in parallel with latency |
| `novada_discover` | List all tools by category with activation status |

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NOVADA_API_KEY` | Yes | Your Novada API key |
| `NOVADA_BROWSER_WS` | Optional | Browser API WebSocket — enables `novada_browser` tools |
| `NOVADA_PROXY_USER` | Optional | Proxy username — enables `novada_proxy_*` tools |
| `NOVADA_PROXY_PASS` | Optional | Proxy password |
| `NOVADA_PROXY_ENDPOINT` | Optional | Proxy endpoint hostname |

---

## Load Only What You Need

Set `NOVADA_GROUPS` to limit which tools are registered:

```json
{
  "env": {
    "NOVADA_API_KEY": "your_key",
    "NOVADA_GROUPS": "search,extract,research"
  }
}
```

Valid groups: `search`, `extract`, `crawl`, `map`, `research`, `scrape`, `proxy`, `verify`, `unblock`, `browser`, `health`, `discover`, `scraper_submit`, `scraper_status`, `scraper_result`, `proxy_residential`, `proxy_isp`, `proxy_datacenter`, `proxy_mobile`, `proxy_static`, `proxy_dedicated`, `browser_flow`

---

## MCP Config Not Picking Up Changes?

If tools still report `not configured` after updating env vars:

```bash
# Kill stale MCP processes — next tool call auto-respawns with fresh config
pkill -f "novada-mcp"
```

Or start a fresh Claude session.

---

## Links

- API key + docs: [novada.com](https://www.novada.com)
- Enterprise & B2B: [sales@novada.com](mailto:sales@novada.com)
- Issues: [github.com/NovadaLabs/novada-mcp/issues](https://github.com/NovadaLabs/novada-mcp/issues)
