# A/B Test: scraperapi vs Scraper API — Definitive Engine Routing
**Date:** 2026-04-23 | **Total tasks:** 20 (Interface A) + 20 (Interface B) + 43 cumulative Scraper API tasks

---

## Interface A: `scraperapi.novada.com/search` (legacy, sync)

**Result: ALL 20 calls failed — `402 Package expired`**

The API key `c77dd8...` package has expired. This endpoint is no longer usable with current credentials. All 5 engines returned `Api Key error: Package expired`.

**Conclusion: Interface A is DEAD for this account.**

---

## Interface B: `scraper.novada.com/request` (Scraper API, async)

### Task Submission (20 calls)

| Engine | scraper_id | Submitted | Accepted |
|--------|-----------|-----------|----------|
| Google | `google_search` | 4 | ✅ 4/4 (100%) |
| Bing | `bing_search` | 4 | ✅ 4/4 (100%) |
| DuckDuckGo | `duckduckgo` | 4 | ✅ 4/4 (100%) |
| Yahoo | `yahoo_search` / `yahoo` | 4 | ❌ 0/4 (11006 Scraper error) |
| Yandex | `yandex` (NOT `yandex_search`) | 2+2 | ✅ 2/2 with `yandex` / ❌ 2/2 with `yandex_search` |

### Task Completion (43 cumulative tasks, checked via OAuth2 → api-m.novada.com)

| Engine | Success | Failed | Total | **Completion Rate** | Error |
|--------|---------|--------|-------|-------------------|-------|
| **Bing** | 11 | 0 | 11 | **100%** | — |
| **DuckDuckGo** | 7 | 0 | 7 | **100%** | — |
| **Yandex** | 2 | 1 | 3 | **67%** | 500 Internal Server Error |
| **Google** | 2 | 20 | 22 | **9%** | 500 Internal Server Error |
| Yahoo | — | — | — | **N/A** | 11006 (scraper not found) |

---

## Final Engine Routing Decision

```
PRIMARY (Scraper API — async):
  bing        → 100% completion, $0.0012/task, 11-25KB results
  duckduckgo  → 100% completion, $0.0012/task, 17-37KB results

SECONDARY (Scraper API — lower reliability):
  yandex      → 67% completion, use scraper_id="yandex" + yandex_domain=yandex.com

DO NOT USE:
  google      → 9% completion on Scraper API (500 errors)
  google      → scraperapi.novada.com package expired
  yahoo       → not available on either interface

DEFAULT ENGINE: bing (most reliable + best result quality)
FALLBACK: duckduckgo (equally reliable)
```

---

## MCP Implementation Plan

### Search Flow
```
Agent calls novada_search(query, engine):
  1. If engine=bing or duckduckgo:
     → Submit to scraper.novada.com/request (Bearer Scraper API key)
     → Get OAuth2 token from api-m.novada.com/v1/oauth2/token (cached, 7-day TTL)
     → Poll api-m.novada.com/v1/scraper/task_list until status=1
     → Download results via task_download (param format TBD from Novada team)
     → Return formatted results to agent

  2. If engine=google:
     → ⚠️ Neither interface works reliably (scraperapi expired, Scraper API 9%)
     → Auto-fallback to bing on Scraper API
     → Note in response: "Google unavailable, results from Bing"

  3. If engine=yandex:
     → Try Scraper API with scraper_id=yandex
     → If fails, fallback to bing

  4. If engine=yahoo:
     → Auto-fallback to bing (Yahoo not available)

Default engine: bing (changed from google)
```

### Required Credentials
```
NOVADA_SCRAPER_KEY=1f35b477c9e1802778ec64aee2a6adfa    # For task submission
NOVADA_API_USERNAME=novada_c3dc3be46f7                   # For OAuth2 token
NOVADA_API_SECRET=863270b49b2dc2f7f0c7d03f56247669       # For OAuth2 token
```

### Remaining Blocker
The `task_download` endpoint parameter format — need from Novada team. Endpoint exists at `POST api-m.novada.com/v1/scraper/task_download` but returns "Invalid parameter" for all param combinations tested.

---

## Key Discovery: scraperapi Package Expired

The legacy `scraperapi.novada.com` API key (`c77dd8...`) package has expired. This means:
- `novada_search` on the current MCP (which uses scraperapi) is now **completely broken** for all engines
- `novada_research` (which also uses scraperapi for Google search) is also **broken**
- Migration to Scraper API is now **mandatory**, not optional

---

*Tested 2026-04-23. Both interfaces verified with curl. Task completion verified via OAuth2 → api-m.novada.com/v1/scraper/task_list.*
