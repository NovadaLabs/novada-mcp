# Novada Backend — Critical Issues Report
**From:** Novada MCP Team | **Date:** 2026-04-22
**Context:** 122 live test calls, competitive benchmarking against Tavily MCP + Firecrawl MCP
**Urgency:** HIGH — these issues make Novada uncompetitive in the AI agent market

---

## Executive Summary

We built an MCP server wrapper around Novada's API for AI agents (Claude, Cursor, VS Code, etc.). After 122 live tests, **7 backend issues** prevent us from competing with Tavily and Firecrawl. Four of five search engines are broken. The proxy endpoint for URL fetching returns 404. Geo-targeting is absent, causing wrong-locale content.

The AI agent MCP market is moving fast. Tavily has AI-ranked relevance. Firecrawl has autonomous browser agents. If Novada's backend remains broken, the MCP will be bypassed by agents in favor of competitors — regardless of how good our wrapper is.

---

## Issue 1: CRITICAL — 4/5 Search Engines Broken at scraperapi.novada.com/search

### What's Happening

| Engine | Error | Test Count | Success Rate |
|--------|-------|-----------|-------------|
| Google | Works (sequential only) | 31 calls | ~33% (100% sequential, 0% parallel) |
| Bing | Query param silently dropped → wrong results | 7 calls | 0% correct results |
| DuckDuckGo | `API_DOWN` every call | 7 calls | 0% |
| Yahoo | `410: empty query built` | 7 calls | 0% |
| Yandex | `INVALID_API_KEY` | 7 calls | 0% |

### Evidence

**Yahoo:** We send `GET /search?q=vector+databases+comparison+2025&engine=yahoo&api_key=...`. Response: `{code: 410, msg: "Build url error: empty query built"}`. The `q` parameter is present and correctly encoded. The backend's URL builder drops it.

**Bing:** We send `q=LLM+fine-tuning+techniques+comparison`. Response: 10 results about generic "Large Language Models" — none about fine-tuning. The query string is silently ignored and a default/fallback query runs instead.

**DuckDuckGo:** Every call returns `API_DOWN`. Tested across 3 independent rounds over several hours. Likely Novada IPs are blocked by DDG, or the worker pool for DDG is not provisioned.

**Yandex:** `INVALID_API_KEY` — the account appears to have no Yandex Search API key provisioned.

**Google (parallel):** When 2+ Google search calls run simultaneously, both fail with `413: WorkerPool not initialized`. Sequential calls work fine. The worker pool doesn't support concurrency.

### Competitive Impact

Tavily and Firecrawl both offer single-engine search that works 100% of the time. We advertise 5 engines but deliver 1 (Google sequential only). Agents learn quickly which tools are reliable. After 2-3 failures, agents stop trying non-Google engines entirely.

### What We Need

1. Fix Yahoo URL builder — the `q` param is being dropped
2. Fix Bing query passthrough — query string silently lost
3. Restore DuckDuckGo workers or unblock IPs
4. Provision Yandex API key or remove engine from the API
5. Size Google WorkerPool for at least 5 concurrent requests

---

## Issue 2: CRITICAL — scraperapi.novada.com Root Endpoint Returns 404

### What's Happening

`GET https://scraperapi.novada.com?api_key=...&url=https://example.com` returns HTTP 404.

Only the `/search` sub-path works. The root path (used for URL fetching / content extraction) is dead.

### Impact

Our entire extract/crawl/map proxy chain was silently broken. All "successful" extract/crawl calls in our tests were actually falling back to direct fetch (no proxy). This means:
- No anti-bot bypass for any extraction
- No residential IP rotation
- Sites that block datacenter IPs fail silently

We've implemented Web Unblocker as a workaround (`POST webunlocker.novada.com/request`), but this shouldn't be the primary path — it's more expensive and slower.

### What We Need

Either fix the scraperapi root endpoint, or provide a documented replacement endpoint for URL fetching with the same API key.

---

## Issue 3: MEDIUM — No Geo-Targeting on scraperapi Proxy

### What's Happening

Proxy exit IPs are in the EU (likely Germany). When agents extract US-centric sites (stripe.com, etc.), they get locale-redirected content:
- `stripe.com/pricing` → `stripe.com/de/pricing` → 144 chars, German, "Preise und Gebühren"
- Expected: English pricing page, ~5000+ chars

### Evidence

Web Unblocker returns correct US-English content (918KB) for the same URL. So Novada CAN serve US content — it's just not the default on scraperapi.

### What We Need

Add a `country` parameter to the scraperapi proxy endpoint (like the search endpoint already has). Default to `us` for English-language requests.

---

## Competitive Urgency

### Market Context

The MCP (Model Context Protocol) server market is the primary channel for AI agents to access web data. Three players are competing:

| Feature | Novada (current) | Tavily | Firecrawl |
|---------|-----------------|--------|-----------|
| Search engines | 1 working (Google) | 1 (reliable) | 1 (reliable) |
| Search quality | Raw Google order | AI-ranked relevance | 77% coverage |
| Extract reliability | ~50% (proxy dead) | High | High |
| Browser agent | None | None | FIRE-1 (clicks, forms, CAPTCHAs) |
| Structured extraction | None | None | JSON Schema |
| Async crawl | None | Partial | Full (job ID + polling) |
| Agent guidance | Agent Hints (unique) | None | None |

### The Window

Novada's Agent Hints concept is unique and valuable. No competitor tells agents what to do next. This is a real differentiator — but only if the underlying data is reliable.

If the 5-engine search worked, Novada would be the clear choice for agents that need geographic and engine diversity. If the proxy endpoint worked, Novada's extract/crawl would be competitive on coverage.

The fixes are backend infrastructure issues, not fundamental product redesigns. The window to fix them is now — before agents develop permanent preferences for Tavily/Firecrawl.

---

## Reproduction

All issues can be reproduced with:

```bash
# Yahoo 410
curl "https://scraperapi.novada.com/search?q=test+query&engine=yahoo&api_key=YOUR_KEY"

# Bing query drop
curl "https://scraperapi.novada.com/search?q=specific+technical+query&engine=bing&api_key=YOUR_KEY"
# Compare results against actual Bing search — results won't match

# DDG down
curl "https://scraperapi.novada.com/search?q=test&engine=duckduckgo&api_key=YOUR_KEY"

# Yandex no key
curl "https://scraperapi.novada.com/search?q=test&engine=yandex&api_key=YOUR_KEY"

# Root path 404
curl "https://scraperapi.novada.com?url=https://example.com&api_key=YOUR_KEY"
```

---

*We're committed to making Novada the best web data MCP. These backend fixes, combined with our MCP-layer improvements, would make Novada competitive with or superior to both Tavily and Firecrawl within weeks.*
