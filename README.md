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
