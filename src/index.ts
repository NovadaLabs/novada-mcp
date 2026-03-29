#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { AxiosError } from "axios";
import {
  novadaSearch,
  novadaExtract,
  novadaCrawl,
  novadaResearch,
  validateSearchParams,
  validateExtractParams,
  validateCrawlParams,
  validateResearchParams,
} from "./tools/index.js";

// ─── Configuration ───────────────────────────────────────────────────────────

import { VERSION } from "./config.js";

const API_KEY = process.env.NOVADA_API_KEY;

// ─── Tool Definitions ────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "novada_search",
    description:
      "Search the web using Novada's Scraper API. Returns structured search results from Google, Bing, and other engines. Use for finding current information, news, facts, or data.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "The search query string" },
        engine: {
          type: "string",
          description: "Search engine to use. Google is recommended for best relevance. Bing results may vary in quality.",
          enum: ["google", "bing", "duckduckgo", "yahoo", "yandex"],
          default: "google",
        },
        num: { type: "number", description: "Number of results to return (1-20)", default: 10, minimum: 1, maximum: 20 },
        country: { type: "string", description: "Country code for localized results (e.g., 'us', 'uk', 'de')", default: "" },
        language: { type: "string", description: "Language code for results (e.g., 'en', 'zh', 'de')", default: "" },
      },
      required: ["query"],
    },
  },
  {
    name: "novada_extract",
    description:
      "Extract content from a single URL. Returns title, description, main text, and meaningful links using readability-based extraction. Note: works best with server-rendered pages; JavaScript-heavy SPAs may return incomplete content.",
    inputSchema: {
      type: "object" as const,
      properties: {
        url: { type: "string", description: "The URL to extract content from" },
        format: { type: "string", description: "Output format", enum: ["text", "markdown", "html"], default: "markdown" },
      },
      required: ["url"],
    },
  },
  {
    name: "novada_crawl",
    description:
      "Crawl a website starting from a seed URL. Discovers and extracts content from multiple same-domain pages. Reports why it stops early if max_pages isn't reached. Note: static HTML crawling — JavaScript-rendered pages may return incomplete content.",
    inputSchema: {
      type: "object" as const,
      properties: {
        url: { type: "string", description: "The seed URL to start crawling from" },
        max_pages: { type: "number", description: "Maximum number of pages to crawl (1-20)", default: 5, minimum: 1, maximum: 20 },
        strategy: { type: "string", description: "Crawl strategy: bfs (breadth-first) or dfs (depth-first)", enum: ["bfs", "dfs"], default: "bfs" },
      },
      required: ["url"],
    },
  },
  {
    name: "novada_research",
    description:
      "Multi-step web research. Generates diverse search queries from different angles, executes them in parallel, deduplicates sources, and returns a comprehensive report. Best for complex questions needing multiple perspectives.",
    inputSchema: {
      type: "object" as const,
      properties: {
        question: { type: "string", description: "The research question (minimum 5 characters)" },
        depth: { type: "string", description: "Research depth: 'quick' (3 searches) or 'deep' (5-6 searches with Reddit/HN)", enum: ["quick", "deep"], default: "quick" },
      },
      required: ["question"],
    },
  },
];

// ─── MCP Server ──────────────────────────────────────────────────────────────

class NovadaMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      { name: "novada-mcp", version: VERSION },
      { capabilities: { tools: {} } }
    );
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!API_KEY) {
        return {
          content: [{
            type: "text" as const,
            text: "Error: NOVADA_API_KEY is not set. Get your API key at https://www.novada.com and set it as an environment variable.",
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
            result = await novadaExtract(validateExtractParams(args as Record<string, unknown>));
            break;
          case "novada_crawl":
            result = await novadaCrawl(validateCrawlParams(args as Record<string, unknown>));
            break;
          case "novada_research":
            result = await novadaResearch(validateResearchParams(args as Record<string, unknown>), API_KEY);
            break;
          default:
            return {
              content: [{
                type: "text" as const,
                text: `Unknown tool: ${name}. Available: novada_search, novada_extract, novada_crawl, novada_research`,
              }],
              isError: true,
            };
        }

        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        const message =
          error instanceof AxiosError
            ? `HTTP ${error.response?.status || "error"}: ${error.response?.data?.msg || error.message}`
            : error instanceof Error
              ? error.message
              : String(error);
        return {
          content: [{ type: "text" as const, text: `Error: ${message}` }],
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
    console.log(`  ${tool.name} — ${tool.description.split(".")[0]}`);
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
  novada_search    Search the web via Google, Bing, and more
  novada_extract   Extract content from any URL (static HTML)
  novada_crawl     Crawl a website (BFS/DFS, static HTML)
  novada_research  Multi-step web research with synthesis
`);
  process.exit(0);
}

const server = new NovadaMCPServer();
server.run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
