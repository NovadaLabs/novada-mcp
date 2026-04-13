// ─── MCP Resources ────────────────────────────────────────────────────────────
// Read-only data agents can access before making tool decisions.
// Reduces hallucination ("does novada support X?") and fixes LobeHub Resources criterion.

interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

interface ResourceContent {
  uri: string;
  mimeType: string;
  text: string;
}

interface ListResourcesResult {
  resources: Resource[];
}

interface ReadResourceResult {
  contents: ResourceContent[];
}

export const RESOURCES: Resource[] = [
  {
    uri: "novada://engines",
    name: "Supported Search Engines",
    description: "List of search engines available in novada_search with characteristics and recommended use cases",
    mimeType: "text/plain",
  },
  {
    uri: "novada://countries",
    name: "Supported Country Codes",
    description: "Country codes for geo-targeted search in novada_search. 195 countries supported; top 50 listed here.",
    mimeType: "text/plain",
  },
  {
    uri: "novada://guide",
    name: "Agent Tool Selection Guide",
    description: "Decision tree and workflow patterns for choosing between novada_search, extract, crawl, map, and research",
    mimeType: "text/plain",
  },
];

export function listResources(): ListResourcesResult {
  return { resources: RESOURCES };
}

export function readResource(uri: string): ReadResourceResult {
  switch (uri) {
    case "novada://engines":
      return {
        contents: [{
          uri,
          mimeType: "text/plain",
          text: `# Supported Search Engines

google     — Best general-purpose engine, highest relevance. Default choice.
bing       — Good alternative. Required for mkt-based locale targeting (sets mkt param automatically).
duckduckgo — Privacy-focused, no personalization bias. Good for neutral/unfiltered results.
yahoo      — Older index, occasionally surfaces different pages than Google.
yandex     — Best for Russian-language content and Eastern European queries.

## Recommendation
- Default: google
- Russian/CIS content: yandex
- Unbiased results: duckduckgo
- Always pair with country + language for localized results.`,
        }],
      };

    case "novada://countries":
      return {
        contents: [{
          uri,
          mimeType: "text/plain",
          text: `# Country Codes for Geo-Targeted Search
Pass as the 'country' parameter in novada_search. 195 countries total.

## Most Used
us — United States    gb — United Kingdom    de — Germany
fr — France           jp — Japan             cn — China
kr — South Korea      in — India             br — Brazil
ca — Canada           au — Australia         mx — Mexico
es — Spain            it — Italy             nl — Netherlands

## Europe
se — Sweden           no — Norway            dk — Denmark
fi — Finland          ch — Switzerland       at — Austria
pl — Poland           cz — Czech Republic    ru — Russia
pt — Portugal         be — Belgium           gr — Greece
hu — Hungary          ro — Romania           tr — Turkey

## Asia-Pacific
sg — Singapore        hk — Hong Kong         tw — Taiwan
id — Indonesia        th — Thailand          vn — Vietnam
ph — Philippines      my — Malaysia          nz — New Zealand

## Middle East & Africa
sa — Saudi Arabia     ae — UAE               il — Israel
eg — Egypt            ng — Nigeria           za — South Africa
ke — Kenya            ma — Morocco

## Americas
ar — Argentina        co — Colombia          cl — Chile
pe — Peru             ve — Venezuela         ec — Ecuador

Total: 195 countries supported.`,
        }],
      };

    case "novada://guide":
      return {
        contents: [{
          uri,
          mimeType: "text/plain",
          text: `# novada-mcp Agent Tool Selection Guide

## Quick Decision Tree

You have a URL you need to read?
  → novada_extract (or array of URLs for batch)

You need to find URLs on a site?
  → novada_map → then novada_extract on chosen URLs

You have a question needing web data?
  → Complex/multi-angle: novada_research (depth='auto')
  → Simple factual lookup: novada_search

You need content from multiple pages of a site?
  → novada_crawl (with select_paths or instructions to target relevant pages)

You have 5 search result URLs to read?
  → novada_extract with url=[url1, url2, url3, url4, url5] — batch in ONE call

## Tool Comparison

| Tool           | Input              | Output              | Token cost |
|----------------|--------------------|---------------------|------------|
| novada_search  | query string       | URL list + snippets | Low        |
| novada_extract | url or [urls]      | Full page content   | Medium-High|
| novada_map     | root url           | URL list only       | Low        |
| novada_crawl   | root url           | Content of N pages  | High       |
| novada_research| question string    | Cited report        | Medium     |

## Efficient Workflow Patterns

### RAG Pipeline
novada_search → novada_extract([top 5 urls]) → feed to vector store

### Competitive Analysis
novada_map competitor.com → novada_crawl with select_paths=['/pricing','/features'] → synthesize

### Current Events
novada_search with time_range='week' → novada_extract on top results

### Documentation Scraping
novada_map docs.example.com → novada_crawl with instructions='only API reference pages'

### Research Report
novada_research with depth='deep' → novada_extract on 2-3 most relevant sources

## Common Mistakes to Avoid

- Using novada_extract for URL discovery (use novada_map first)
- Using novada_crawl when you only need 1 page (use novada_extract)
- Not using batch extract: calling novada_extract 5 times instead of once with array
- Setting max_pages too high in crawl (large token cost, often unnecessary)
- Not adding time_range for queries about recent events`,
        }],
      };

    default:
      throw new Error(`Unknown resource URI: ${uri}. Available: ${RESOURCES.map(r => r.uri).join(", ")}`);
  }
}
