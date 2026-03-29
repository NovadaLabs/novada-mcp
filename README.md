# Novada MCP Server

![GitHub Repo stars](https://img.shields.io/github/stars/Goldentrii/novada-mcp?style=social)
![npm](https://img.shields.io/npm/dt/novada-mcp)
![npm version](https://img.shields.io/npm/v/novada-mcp)

The Novada MCP server provides AI agents with real-time web data capabilities:

- **Search** — Query Google, Bing, DuckDuckGo, Yahoo, and Yandex with structured results
- **Extract** — Pull content, metadata, and links from any URL
- **Crawl** — Systematically explore websites with BFS/DFS strategies
- **Research** — Multi-step web research with synthesized reports and sources

## Quick Start

### Connect to Claude Code

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) is Anthropic's official CLI tool for Claude. Add the Novada MCP server with one command:

```bash
claude mcp add novada -e NOVADA_API_KEY=your-api-key -- npx -y novada-mcp
```

Get your Novada API key at [novada.com](https://www.novada.com/).

**Tip:** Add `--scope user` to make Novada available across all your projects:

```bash
claude mcp add --scope user novada -e NOVADA_API_KEY=your-api-key -- npx -y novada-mcp
```

Once configured, you'll have access to `novada_search`, `novada_extract`, `novada_crawl`, and `novada_research` tools.

### Connect to Cursor

Add the following to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "novada-mcp": {
      "command": "npx",
      "args": ["-y", "novada-mcp@latest"],
      "env": {
        "NOVADA_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Connect to VS Code

Add to your VS Code settings (`.vscode/mcp.json`):

```json
{
  "servers": {
    "novada": {
      "command": "npx",
      "args": ["-y", "novada-mcp@latest"],
      "env": {
        "NOVADA_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Connect to Windsurf

Add to your `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "novada-mcp": {
      "command": "npx",
      "args": ["-y", "novada-mcp@latest"],
      "env": {
        "NOVADA_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Connect to Claude Desktop

Add to your Claude Desktop config file:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "novada": {
      "command": "npx",
      "args": ["-y", "novada-mcp@latest"],
      "env": {
        "NOVADA_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Tools

### `novada_search`

Search the web using Novada's Scraper API. Returns structured results from multiple search engines.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | — | The search query |
| `engine` | string | No | `"google"` | Search engine: `google`, `bing`, `duckduckgo`, `yahoo`, `yandex` |
| `num` | number | No | `10` | Number of results (1-20) |
| `country` | string | No | `""` | Country code for localized results (e.g., `us`, `uk`, `de`) |
| `language` | string | No | `""` | Language code (e.g., `en`, `zh`, `de`) |

### `novada_extract`

Extract content from a single URL. Returns title, description, main text, and links.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | Yes | — | URL to extract content from |
| `format` | string | No | `"markdown"` | Output format: `text`, `markdown`, `html` |

### `novada_crawl`

Crawl a website starting from a seed URL. Discovers and extracts content from multiple pages.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | Yes | — | Seed URL to start crawling |
| `max_pages` | number | No | `5` | Max pages to crawl (1-20) |
| `strategy` | string | No | `"bfs"` | Crawl strategy: `bfs` (breadth-first) or `dfs` (depth-first) |

### `novada_research`

Multi-step web research. Performs multiple searches, synthesizes findings into a report with sources.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `question` | string | Yes | — | Research question (min 5 characters) |
| `depth` | string | No | `"quick"` | Research depth: `quick` (2-3 searches) or `deep` (5-8 searches) |

## Examples (Real Output)

### Search: "best AI agent frameworks 2025"

```
> novada_search({ query: "best AI agent frameworks 2025", num: 5 })

1. Best AI Agent Frameworks in 2025: A Comprehensive Guide
   URL: https://www.reddit.com/r/AI_Agents/comments/1hq9il6/...
   Here's a look at some of the standout frameworks making waves
   this year: Microsoft AutoGen, Phidata, PromptFlow, OpenAI Swarm.

2. What's the best agent framework in 2025? : r/LLMDevs
   URL: https://www.reddit.com/r/LLMDevs/comments/1nxlsrq/...
   I'm diving into autonomous/AI agent systems and trying to figure
   out which framework is currently the best for building robust,
   scalable, multi-agent systems.

3. Top AI Agent Frameworks in 2025: Honest Reviews
   URL: https://buildwithcham.medium.com/...
   LangGraph for complex, multi-step flows. CrewAI for fast
   role-based agents. Superagent for anything production-grade.

4. The Ultimate Guide to Agentic AI Frameworks in 2025
   URL: https://pub.towardsai.net/...
   Goal-Oriented Thinking. Agents understand objectives, not just
   commands; They break down complex tasks into subtasks.
```

### Extract: novada.com

```
> novada_extract({ url: "https://www.novada.com" })

# Novada Proxy Network | Fast Residential, ISP & Datacenter Proxies

> Access over 100M+ residential, ISP, and datacenter proxies with
> 99.99% uptime. Novada delivers fast, secure, and scalable proxy
> & web scraping solutions for global businesses and developers.

## Content
Proxy Locations: Europe (France, Italy, Germany, Spain, Ukraine),
North America (USA, Canada, Mexico), South America (Brazil, Argentina)...

## Links (20)
- https://www.novada.com/residential-proxies
- https://www.novada.com/scraper-api
- https://www.novada.com/browser-api
...
```

### Research: "How do AI agents use web scraping APIs?"

```
> novada_research({ question: "How do AI agents use web scraping APIs in production?", depth: "quick" })

# Research Report: How do AI agents use web scraping APIs in production?

Depth: quick | Searches: 3 | Results found: 11 | Unique sources: 10

## Key Findings

1. How AI Agents Are Changing the Future of Web Scraping
   https://medium.com/@davidfagb/...
   Instead of using fixed scripts that stop working when a webpage
   changes, these agents can think, understand, and adjust, making
   data extraction more reliable.

2. AI Agent Web Scraping: Data Collection and Analysis
   https://scrapegraphai.com/blog/ai-agent-webscraping
   Discover how AI agents are transforming web scraping and data
   collection. Build intelligent scrapers that adapt, extract,
   and analyze data automatically.

3. Scaling Web Scraping with Data Streaming, Agentic AI
   https://www.confluent.io/blog/real-time-web-scraping/
   We built AI Agents to iteratively create code, crawl, and
   scrape web data at scale using real-time streaming pipelines.

## Sources
1. [How AI Agents Are Changing Web Scraping](https://medium.com/...)
2. [AI Agent Web Scraping](https://scrapegraphai.com/...)
3. [Scaling Web Scraping with Agentic AI](https://www.confluent.io/...)
...
```

## Use Cases

| Use Case | Tool | Example |
|----------|------|---------|
| Market research | `novada_research` | "Compare pricing models of top web scraping APIs" |
| Competitive analysis | `novada_search` + `novada_extract` | Search competitors, then extract their pricing pages |
| Content aggregation | `novada_crawl` | Crawl a documentation site to build a knowledge base |
| Lead generation | `novada_search` | "SaaS companies using web scraping in fintech" |
| SEO monitoring | `novada_search` | Track keyword rankings across Google, Bing, Yandex |
| Data enrichment | `novada_extract` | Pull structured data from any URL for your pipeline |

## Why Novada for AI Agents?

- **Multi-engine search** — Google, Bing, DuckDuckGo, Yahoo, Yandex in one API
- **100M+ proxy IPs** — Access any website from 195+ countries without blocks
- **Built for agents** — MCP-native, structured responses, no HTML parsing needed
- **Research mode** — Multi-step search + synthesis, not just a single query
- **99.99% uptime** — Production-grade infrastructure trusted by global businesses

## Prerequisites

- [Novada API key](https://www.novada.com/) — sign up for free
- [Node.js](https://nodejs.org/) v18 or higher

## Running with NPX

```bash
NOVADA_API_KEY=your-key npx -y novada-mcp@latest
```

## CLI Options

```bash
npx novada-mcp --help        # Show help
npx novada-mcp --list-tools  # List available tools
```

## About Novada

[Novada](https://www.novada.com/) provides web data infrastructure for developers and AI agents — including residential proxies, scraping APIs, and browser automation across 195+ countries with 100M+ IPs.

## Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io) for the MCP specification
- [Anthropic](https://anthropic.com) for Claude Desktop and Claude Code

## License

MIT
