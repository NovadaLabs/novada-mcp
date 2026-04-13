#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  novadaSearch,
  novadaExtract,
  novadaCrawl,
  novadaResearch,
  novadaMap,
  validateSearchParams,
  validateExtractParams,
  validateCrawlParams,
  validateResearchParams,
  validateMapParams,
  classifyError,
} from "./tools/index.js";
import { ZodError } from "zod";
import {
  SearchParamsSchema,
  ExtractParamsSchema,
  CrawlParamsSchema,
  ResearchParamsSchema,
  MapParamsSchema,
} from "./tools/types.js";

// ─── Configuration ───────────────────────────────────────────────────────────

import { VERSION } from "./config.js";
import { listPrompts, getPrompt } from "./prompts/index.js";
import { listResources, readResource } from "./resources/index.js";

const API_KEY = process.env.NOVADA_API_KEY;

/** Convert a Zod v4 schema to MCP-compatible JSON Schema.
 * Uses Zod's native .toJSONSchema() — zod-to-json-schema v3 does not support Zod v4.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function zodToMcpSchema(schema: any): Record<string, unknown> {
  const jsonSchema = schema.toJSONSchema();
  // Strip meta-schema declarations that MCP clients don't need
  const { $schema, $defs, ...rest } = jsonSchema as Record<string, unknown>;
  return rest;
}

// ─── Tool Definitions ────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "novada_search",
    description: `Search the web via 5 engines (Google, Bing, DuckDuckGo, Yahoo, Yandex) with 195-country geo-targeting and anti-bot proxy bypass. Returns titles, URLs, and snippets.

**Best for:** Current facts, news, finding specific pages. Add time_range for recent results. Add include_domains to restrict to trusted sources.
**Not for:** Reading a URL (use novada_extract), multi-source research (use novada_research), site URL discovery (use novada_map).
**Tip:** Use novada_extract with the returned URLs to read full content.`,
    inputSchema: zodToMcpSchema(SearchParamsSchema),
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  {
    name: "novada_extract",
    description: `Extract main content from any URL or batch of URLs (max 10). Returns title, description, body text, and same-domain links. Proxy-routed for anti-bot bypass.

**Best for:** Reading specific pages. Pass url as an array to batch-extract multiple pages in one call (e.g. after novada_search).
**Not for:** JavaScript SPAs (content won't render), site URL discovery (use novada_map).
**Tip:** If content is incomplete, run novada_map first to find the correct subpage URL.`,
    inputSchema: zodToMcpSchema(ExtractParamsSchema),
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  {
    name: "novada_crawl",
    description: `Crawl a website and extract content from multiple pages (BFS or DFS, up to 20 pages). Use select_paths or exclude_paths regex to target specific sections. Use instructions for natural language page guidance.

**Best for:** Extracting content from a doc site, competitive analysis, building knowledge bases.
**Not for:** Single pages (use novada_extract), URL discovery without content (use novada_map — faster).
**Tip:** novada_map → pick relevant URLs → novada_extract is more token-efficient than crawl for selective extraction.`,
    inputSchema: zodToMcpSchema(CrawlParamsSchema),
    annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  },
  {
    name: "novada_research",
    description: `Multi-step web research: generates 3-10 diverse search queries in parallel, deduplicates sources, returns a cited report. Use depth='auto' (default) to let the server choose based on question complexity.

**Best for:** Complex questions needing multiple perspectives, competitive analysis, topic overviews. One call replaces 3-10 manual searches.
**Not for:** Simple lookups (use novada_search), reading a specific URL (use novada_extract).
**Tip:** Follow up with novada_extract on the most relevant source URLs for full content.`,
    inputSchema: zodToMcpSchema(ResearchParamsSchema),
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  {
    name: "novada_map",
    description: `Discover all URLs on a website without extracting content — much faster than crawl for URL discovery. Use search param to filter by keyword. Use max_depth to control traversal depth.

**Best for:** Understanding site structure, finding specific subpages before extracting, recovering when novada_extract returns incomplete content.
**Not for:** When you already have the URL (use novada_extract directly).
**Warning:** Returns limited results on JavaScript SPAs — will include a hint if this is detected.`,
    inputSchema: zodToMcpSchema(MapParamsSchema),
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
];

// ─── MCP Server ──────────────────────────────────────────────────────────────

class NovadaMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      { name: "novada-mcp", version: VERSION },
      { capabilities: { tools: {}, prompts: {}, resources: {} } }
    );
    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error: unknown) => {
      console.error("[novada-mcp]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => listPrompts() as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return getPrompt(name, (args as Record<string, string>) || {}) as any;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => listResources() as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return readResource(request.params.uri) as any;
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!API_KEY) {
        return {
          content: [{
            type: "text" as const,
            text: "Error: NOVADA_API_KEY is not set. Get your API key at https://www.novada.com and set it as an environment variable.\n\nSetup: claude mcp add novada -e NOVADA_API_KEY=your-key -- npx -y novada-mcp",
          }],
          isError: true,
        };
      }

      try {
        let result: string;

        switch (name) {
          case "novada_search":
            result = await novadaSearch(validateSearchParams(args as Record<string, unknown>), API_KEY);
            break;
          case "novada_extract":
            result = await novadaExtract(validateExtractParams(args as Record<string, unknown>), API_KEY);
            break;
          case "novada_crawl":
            result = await novadaCrawl(validateCrawlParams(args as Record<string, unknown>), API_KEY);
            break;
          case "novada_research":
            result = await novadaResearch(validateResearchParams(args as Record<string, unknown>), API_KEY);
            break;
          case "novada_map":
            result = await novadaMap(validateMapParams(args as Record<string, unknown>), API_KEY);
            break;
          default:
            return {
              content: [{
                type: "text" as const,
                text: `Unknown tool: ${name}. Available: novada_search, novada_extract, novada_crawl, novada_research, novada_map`,
              }],
              isError: true,
            };
        }

        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        // Zod validation errors → clear message for the agent
        if (error instanceof ZodError) {
          const issues = error.issues.map(i => `  ${i.path.join(".")}: ${i.message}`).join("\n");
          return {
            content: [{
              type: "text" as const,
              text: `Invalid parameters for ${name}:\n${issues}`,
            }],
            isError: true,
          };
        }

        // Classified API/network errors with retry guidance
        const classified = classifyError(error);
        return {
          content: [{
            type: "text" as const,
            text: `Error [${classified.code}]: ${classified.message}${classified.retryable ? "\n(This error is retryable)" : ""}${classified.docsUrl ? `\nDocs: ${classified.docsUrl}` : ""}`,
          }],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`Novada MCP server v${VERSION} running on stdio`);
  }
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

const cliArgs = process.argv.slice(2);

if (cliArgs.includes("--list-tools")) {
  for (const tool of TOOLS) {
    const firstLine = tool.description.trim().split("\n")[0];
    console.log(`  ${tool.name} — ${firstLine}`);
  }
  process.exit(0);
}

if (cliArgs.includes("--help") || cliArgs.includes("-h")) {
  console.log(`novada-mcp v${VERSION} — MCP Server for Novada web data API

Usage:
  npx novada-mcp              Start the MCP server (stdio transport)
  npx novada-mcp --list-tools Show available tools
  npx novada-mcp --help       Show this help

Environment:
  NOVADA_API_KEY  Your Novada API key (required)
                  Get one at https://www.novada.com

Connect to Claude Code:
  claude mcp add novada -e NOVADA_API_KEY=your_key -- npx -y novada-mcp

Tools:
  novada_search    Search the web via Google, Bing, and 3 more engines
  novada_extract   Extract content from any URL (via proxy)
  novada_crawl     Crawl a website (BFS/DFS, up to 20 pages)
  novada_research  Multi-step web research with synthesis
  novada_map       Discover all URLs on a website (fast)
`);
  process.exit(0);
}

const server = new NovadaMCPServer();
server.run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
