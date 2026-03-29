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
| `depth` | string | No | `"quick"` | Research depth: `quick` (3 searches) or `deep` (5-6 searches) |

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

### For AI Agent Developers

| Use Case | Tools | How It Works |
|----------|-------|-------------|
| **RAG pipeline data source** | `novada_search` + `novada_extract` | Agent searches for relevant documents, extracts full text, feeds into vector database for retrieval-augmented generation |
| **Agentic web research** | `novada_research` | Agent receives a complex question, Novada runs multi-step searches and returns a synthesized report with citations — no manual search loop needed |
| **Real-time knowledge grounding** | `novada_search` | Agent needs facts beyond its training cutoff — one tool call returns current, structured web results |
| **Tool-augmented chatbots** | `novada_search` + `novada_extract` | Chatbot detects user question needs live data, calls Novada, presents fresh answer with source URLs |
| **Automated competitive intelligence** | `novada_crawl` + `novada_extract` | Agent crawls competitor websites weekly, extracts pricing/feature changes, generates diff reports |

### For Data Engineers & Analysts

| Use Case | Tools | How It Works |
|----------|-------|-------------|
| **Lead generation** | `novada_search` | Search "SaaS companies using AI in healthcare" → structured list of companies with URLs for enrichment |
| **Price monitoring** | `novada_extract` | Extract product prices from e-commerce URLs on a schedule, detect price changes |
| **Content aggregation** | `novada_crawl` | Crawl a documentation site (max 20 pages) to build a local knowledge base or training dataset |
| **Multi-market SEO tracking** | `novada_search` | Track keyword rankings across Google, Bing, Yandex, DuckDuckGo from different countries simultaneously |
| **News monitoring** | `novada_search` | Monitor breaking news on any topic across multiple search engines in real time |

### For LLM Application Builders

| Use Case | Tools | How It Works |
|----------|-------|-------------|
| **LangChain / LlamaIndex tool** | Any | Wrap Novada MCP tools as LangChain tools — agent decides when to search, extract, or research |
| **Multi-agent workflows** | `novada_research` | Research agent gathers data, analyst agent processes it, writer agent produces report — Novada powers the data layer |
| **Fact-checking pipeline** | `novada_search` | LLM generates a claim, agent searches for supporting/contradicting evidence, returns verdict with sources |
| **Document Q&A with web fallback** | `novada_search` + `novada_extract` | If local documents don't have the answer, agent falls back to web search and extraction |
| **Automated due diligence** | `novada_crawl` + `novada_research` | Crawl a company's website, research their market position, generate investment memo |

### Workflow Examples

**Example 1: AI Research Assistant**
```
User: "What are the latest developments in quantum computing?"
Agent: novada_research({ question: "latest quantum computing breakthroughs 2025 2026", depth: "deep" })
→ Returns 15+ sources, synthesized report, key findings
→ Agent summarizes and presents with citations
```

**Example 2: Competitive Analysis Pipeline**
```
Agent: novada_search({ query: "top web scraping APIs comparison" })
→ Gets list of competitors
Agent: novada_extract({ url: "https://competitor.com/pricing" })
→ Extracts pricing details from each competitor
Agent: Compiles comparison table with pricing, features, limits
```

**Example 3: Knowledge Base Builder**
```
Agent: novada_crawl({ url: "https://docs.example.com", max_pages: 20, strategy: "bfs" })
→ Crawls entire documentation site
→ Returns structured content from each page
Agent: Chunks content, generates embeddings, stores in vector DB
```

## Why Novada for AI Agents?

### vs. Direct Web Scraping

| | Direct Scraping | Novada MCP |
|---|---|---|
| Setup time | Hours (Playwright, proxies, anti-bot) | 1 command |
| Blocked by websites | Frequently | Rarely (100M+ rotating IPs) |
| Structured output | Raw HTML to parse | Clean text, titles, links |
| Multi-engine search | Build each integration | 5 engines, one API |
| Maintenance | Scripts break when sites change | Novada handles it |

### vs. Other MCP Search Tools

| Feature | Novada | Tavily | Firecrawl | Brave Search |
|---------|--------|--------|-----------|-------------|
| Web search | Google + Bing (3 more available) | 1 engine | No | 1 engine |
| URL extraction | Yes | Yes | Yes | No |
| Website crawling | Yes (BFS/DFS) | Yes | Yes | No |
| Multi-step research | Yes | Yes | No | No |
| Proxy infrastructure | 100M+ IPs, 195 countries | No | No | No |
| Anti-bot bypass | Built-in | No | Partial | No |
| Browser rendering | No (static HTML) | No | Yes | No |
| Localized results | Country + language | Country | No | Country |
| Free tier | Yes | Yes | Yes | Yes |

### Key Advantages

- **Multi-engine search** — Google (recommended) and Bing fully supported. DuckDuckGo, Yahoo, Yandex available but may have limited reliability depending on Novada's upstream API status.
- **100M+ proxy IPs across 195 countries** — Access any website without blocks, CAPTCHAs, or rate limits. Your agent never gets a 403.
- **Built for agents, not humans** — MCP-native from day one. Structured responses, no HTML parsing, no browser automation code needed.
- **Research mode** — Your agent asks one question, Novada performs 3-8 searches, deduplicates sources, and returns a synthesized report. No manual search loops.
- **99.99% uptime on Novada's API** — Novada's search and proxy infrastructure has 99.99% uptime SLA. The MCP server itself runs locally on your machine.
- **Privacy-first** — Novada does not store or log your search queries or extracted content. Your agent's data stays yours.
- **Active development** — New tools and capabilities added regularly. Built by the team behind [novada.com](https://www.novada.com/).

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
