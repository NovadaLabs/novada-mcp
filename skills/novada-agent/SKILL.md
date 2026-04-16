---
name: novada-agent
description: >-
  Use Novada MCP tools for web tasks. Covers tool selection (search vs extract
  vs crawl vs map vs research), key parameters, common workflows, and
  when NOT to call each tool. Trigger: any task requiring web data, content
  extraction, site crawling, or multi-source research.
---

# Novada Agent Skill

You have access to 5 Novada MCP tools. This skill tells you exactly which tool to use when and how to use it effectively.

## Tool Selection — Decision Tree

```
Need web data?
├── Have specific URLs already? → novada_extract
├── Need to find URLs first?
│   ├── 1-2 targeted queries → novada_search
│   ├── Explore an entire site → novada_map or novada_crawl
│   └── Multi-faceted question → novada_research
└── Want a ready-made answer with sources? → novada_research
```

Also read `novada://guide` — it contains the full decision tree and workflow patterns.

## The 5 Tools

### `novada_search`

**When:** Find pages matching a query. You know what you're looking for, not where it lives.

**Key parameters:**
- `query` — your search string
- `engine` — `google` (default), `bing`, `duckduckgo`, `yahoo`, `yandex`
- `num` — results count, 1-20 (default 10)
- `time_range` — `day`, `week`, `month`, `year`
- `include_domains` / `exclude_domains` — up to 10 domains each
- `country` — ISO code for geo-targeting (195 countries supported)

**When NOT to use:** You already have the URL — use `novada_extract` instead.

**Example:**
```json
{
  "query": "Claude API function calling examples 2025",
  "engine": "google",
  "num": 5,
  "time_range": "year",
  "include_domains": ["anthropic.com", "github.com"]
}
```

---

### `novada_extract`

**When:** You have specific URLs and need their content.

**Key parameters:**
- `url` — single URL string, or array of up to 10 URLs for parallel batch
- `format` — `markdown` (default), `text`, `html`
- `query` — optional: focuses the content summary on a specific aspect

**Batch mode:** Pass `url: ["url1", "url2"]` to extract multiple pages in one call — faster than calling extract once per URL.

**When NOT to use:** You don't have URLs yet — use `novada_search` or `novada_map` first.

**Example (single):**
```json
{ "url": "https://docs.anthropic.com/en/api/getting-started", "format": "markdown" }
```

**Example (batch):**
```json
{
  "url": ["https://example.com/page1", "https://example.com/page2"],
  "format": "markdown",
  "query": "pricing information"
}
```

---

### `novada_crawl`

**When:** You need content from multiple pages of a site but don't have all URLs.

**Key parameters:**
- `url` — starting URL (root)
- `max_pages` — 1-20 (default 5)
- `strategy` — `bfs` (breadth-first, broad coverage) or `dfs` (depth-first, deep paths)
- `select_paths` — regex patterns to restrict to specific paths, e.g. `["/docs/.*"]`
- `exclude_paths` — regex patterns to skip, e.g. `["/blog/.*", "/changelog/.*"]`
- `instructions` — natural language hint: `"only API reference pages"`

**When NOT to use:**
- You just want a list of URLs → use `novada_map` instead (no content extraction)
- You already have all URLs → use `novada_extract` batch

**Example:**
```json
{
  "url": "https://docs.example.com",
  "max_pages": 10,
  "strategy": "bfs",
  "select_paths": ["/api/.*"],
  "instructions": "only API endpoint reference pages, skip tutorials"
}
```

---

### `novada_map`

**When:** You need to discover URLs on a site without extracting their content. Site exploration, inventory, link collection.

**Key parameters:**
- `url` — root URL to map
- `limit` — max URLs to return, 1-100 (default 50)
- `max_depth` — link hops from root, 1-5 (default 2)
- `search` — optional keyword to filter returned URLs
- `include_subdomains` — include URLs on subdomains (default false)

**Use then chain:** `novada_map` → filter the URL list → `novada_extract` batch on selected URLs. This is more efficient than `novada_crawl` when you need selective extraction.

**Example:**
```json
{
  "url": "https://docs.example.com",
  "limit": 100,
  "max_depth": 3,
  "search": "authentication"
}
```

---

### `novada_research`

**When:** You have a question that needs multiple sources to answer well. You want synthesis, not raw search results.

**What it does:** Generates 3-10 parallel search queries, deduplicates up to 15 unique sources, returns a cited report with source list.

**Key parameters:**
- `question` — the research question (full sentence works best)
- `depth` — `auto` (default, server picks), `quick` (3 searches), `deep` (5-6), `comprehensive` (8-10)
- `focus` — optional: `"technical implementation"`, `"business impact"`, `"recent news only"`

**When NOT to use:** You need real-time data or very specific factual lookups — `novada_search` is more precise.

**Example:**
```json
{
  "question": "What are the best practices for implementing JWT refresh token rotation in 2025?",
  "depth": "deep",
  "focus": "security and implementation"
}
```

---

## Common Workflows

### Research + Extract
1. `novada_research` for the broad answer
2. Identify key sources from the report
3. `novada_extract` on the most relevant URLs for full content

### Competitive Analysis
1. `novada_search` for competitor pages
2. `novada_extract` batch on top results
3. Synthesize findings

### Full Site Documentation Extraction
1. `novada_map` to discover all doc URLs
2. Filter to relevant paths
3. `novada_extract` batch (up to 10 per call) on filtered list

### Fresh News
1. `novada_search` with `time_range: "week"` or `start_date`
2. `novada_extract` on top 3-5 results

---

## Rules

1. **Batch > sequential**: Always use `novada_extract` with a URL array instead of multiple single-URL calls.
2. **Map before crawl for selective work**: If you only need specific pages, `novada_map` + filter + `novada_extract` is more efficient than `novada_crawl`.
3. **Use `focus` in research**: A focused research question produces tighter, more relevant sub-queries.
4. **Check `novada://engines`**: Different engines have different strengths — Bing has better news freshness, DuckDuckGo has better privacy site support.
5. **`novada_research` is not a search**: It synthesizes. Don't use it when you need raw URLs or specific lookups.
