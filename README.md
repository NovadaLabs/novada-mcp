<p align="center">
  <h1 align="center">Novada MCP Server</h1>
  <p align="center"><strong>Search, extract, crawl, map, and research the web — from any AI agent or terminal.</strong></p>
  <p align="center">Powered by <a href="https://www.novada.com">novada.com</a> — 100M+ proxy IPs across 195 countries.</p>
</p>

<p align="center">
  <a href="https://www.novada.com"><img src="https://img.shields.io/badge/novada.com-API_Key-ff6b35?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48L3N2Zz4=" alt="novada.com"></a>
  <a href="https://www.npmjs.com/package/novada-mcp"><img src="https://img.shields.io/npm/v/novada-mcp?style=for-the-badge&label=MCP&color=blue" alt="npm version"></a>
  <a href="https://lobehub.com/mcp/goldentrii-novada-mcp"><img src="https://img.shields.io/badge/LobeHub-MCP-purple?style=for-the-badge" alt="LobeHub MCP"></a>
  <a href="https://smithery.ai/server/novada-mcp"><img src="https://img.shields.io/badge/Smithery-install-8B5CF6?style=for-the-badge" alt="Smithery"></a>
  <a href="#tools"><img src="https://img.shields.io/badge/tools-5-brightgreen?style=for-the-badge" alt="5 tools"></a>
  <a href="#novada_search"><img src="https://img.shields.io/badge/engines-5-orange?style=for-the-badge" alt="5 engines"></a>
  <a href="#nova--try-it-in-10-seconds"><img src="https://img.shields.io/badge/CLI-nova-blueviolet?style=for-the-badge" alt="CLI nova"></a>
  <a href="https://www.novada.com"><img src="https://img.shields.io/badge/proxy_IPs-100M+-red?style=for-the-badge" alt="100M+ proxy IPs"></a>
  <a href="https://www.novada.com"><img src="https://img.shields.io/badge/countries-195-cyan?style=for-the-badge" alt="195 countries"></a>
  <img src="https://img.shields.io/badge/tests-117-green?style=for-the-badge" alt="117 tests">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge" alt="MIT License"></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/novada-mcp"><img src="https://img.shields.io/npm/dt/novada-mcp" alt="downloads"></a>
  <a href="https://github.com/Goldentrii/novada-mcp"><img src="https://img.shields.io/github/stars/Goldentrii/novada-mcp?style=social" alt="stars"></a>
</p>

<p align="center">
  <a href="#nova--try-it-in-10-seconds">Quick Start</a> ·
  <a href="#tools">Tools</a> ·
  <a href="#real-output-examples">Examples</a> ·
  <a href="#use-cases">Use Cases</a> ·
  <a href="#why-novada">Comparison</a> ·
  <a href="#nova--try-it-in-10-seconds">CLI</a> ·
  <a href="#中文文档">中文</a>
</p>

---

## `nova` — Try It in 10 Seconds

```bash
npm install -g novada-mcp
export NOVADA_API_KEY=your-key    # Free at novada.com
```

<p align="center">
  <img src="https://img.shields.io/badge/nova_search-query-blue?style=for-the-badge" alt="nova search">
  <img src="https://img.shields.io/badge/nova_extract-url-green?style=for-the-badge" alt="nova extract">
  <img src="https://img.shields.io/badge/nova_crawl-url-orange?style=for-the-badge" alt="nova crawl">
  <img src="https://img.shields.io/badge/nova_map-url-blueviolet?style=for-the-badge" alt="nova map">
  <img src="https://img.shields.io/badge/nova_research-question-red?style=for-the-badge" alt="nova research">
</p>

```bash
nova search "best desserts in Düsseldorf" --country de
nova extract https://example.com
nova map https://docs.example.com --search "api"
nova research "How do AI agents use web scraping?" --depth deep
```

---

## Real Output Examples

### `nova search "best desserts in Düsseldorf" --country de`

```
[Results: 4 | Engine: google | Country: de | Via: Novada proxy]

1. **THE BEST Dessert in Düsseldorf**
   URL: https://www.tripadvisor.com/Restaurants-g187373-zfg9909-Dusseldorf...
   Dessert in Düsseldorf:
   1. Heinemann Konditorei Confiserie (4.4★, 298 reviews)
   2. Eis-Café Pia (4.5★, 182 reviews)
   3. Cafe Huftgold (4.3★)

2. **Top 10 Best Desserts Near Dusseldorf**
   URL: https://www.yelp.com/search?cflt=desserts&find_loc=Dusseldorf...
   1. Namu Café  2. Pure Pastry  3. Tenten Coffee
   4. Eiscafé Pia  5. Pure ...

3. **Good Dessert Spots : r/duesseldorf**
   URL: https://www.reddit.com/r/duesseldorf/comments/1mxh4bj/...
   "I'm moving to Düsseldorf soon and I love trying out desserts!
    Do you guys know any good spots/cafes?"
```

Your agent can then **extract** any URL for full details, or **research** deeper:

```bash
nova extract https://www.tripadvisor.com/Restaurants-g187373-zfg9909-Dusseldorf...
nova research "best German pastries and cafes in Düsseldorf NRW" --depth deep
```

### `nova research "How do AI agents use web scraping?" --depth deep`

```
# Research Report: How do AI agents use web scraping?

**Depth:** deep | **Searches:** 6 | **Results found:** 23 | **Unique sources:** 15

## Key Findings
1. **How AI Agents Are Changing the Future of Web Scraping**
   https://medium.com/@davidfagb/...
   These agents can think, understand, and adjust...

2. **Scaling Web Scraping with Data Streaming, Agentic AI**
   https://www.confluent.io/blog/real-time-web-scraping/
   AI Agents iteratively create code, crawl, and scrape at scale...

## Sources
1. [How AI Agents Are Changing Web Scraping](https://medium.com/...)
2. [Scaling Web Scraping with Agentic AI](https://www.confluent.io/...)
```

### Map → Extract Workflow

```bash
# Step 1: Discover pages
nova map https://docs.example.com --search "webhook"

# Step 2: Extract what you need
nova extract https://docs.example.com/webhooks/events
```

---

## Quick Start

### Claude Code (1 command)

```bash
claude mcp add novada -e NOVADA_API_KEY=your-key -- npx -y novada-mcp
```

`--scope user` for all projects: `claude mcp add --scope user novada -e NOVADA_API_KEY=your-key -- npx -y novada-mcp`

### Smithery (1 click)

Install via [Smithery](https://smithery.ai/server/novada-mcp) — supports Claude Desktop, Cursor, VS Code, and more.

```bash
npx -y @smithery/cli install novada-mcp --client claude
```

<details>
<summary><strong>Cursor / VS Code / Windsurf / Claude Desktop</strong></summary>

**Cursor** — `.cursor/mcp.json`:
```json
{ "mcpServers": { "novada": { "command": "npx", "args": ["-y", "novada-mcp@latest"], "env": { "NOVADA_API_KEY": "your-key" } } } }
```

**VS Code** — `.vscode/mcp.json`:
```json
{ "servers": { "novada": { "command": "npx", "args": ["-y", "novada-mcp@latest"], "env": { "NOVADA_API_KEY": "your-key" } } } }
```

**Windsurf** — `~/.codeium/windsurf/mcp_config.json`:
```json
{ "mcpServers": { "novada": { "command": "npx", "args": ["-y", "novada-mcp@latest"], "env": { "NOVADA_API_KEY": "your-key" } } } }
```

**Claude Desktop** — `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{ "mcpServers": { "novada": { "command": "npx", "args": ["-y", "novada-mcp@latest"], "env": { "NOVADA_API_KEY": "your-key" } } } }
```

</details>

<details>
<summary><strong>Python (via CLI)</strong></summary>

```python
import subprocess, os

result = subprocess.run(
    ["nova", "search", "AI agent frameworks"],
    capture_output=True, text=True,
    env={**os.environ, "NOVADA_API_KEY": "your-key"}
)
print(result.stdout)
```

</details>

---

## Tools

### `novada_search`

Search the web via Google, Bing, or 3 other engines. Returns structured results with titles, URLs, and snippets.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | — | Search query |
| `engine` | string | No | `"google"` | `google` `bing` `duckduckgo` `yahoo` `yandex` |
| `num` | number | No | `10` | Results count (1-20) |
| `country` | string | No | — | Country code (`us`, `uk`, `de`) |
| `language` | string | No | — | Language code (`en`, `zh`, `de`) |
| `time_range` | string | No | — | `day` `week` `month` `year` |
| `start_date` | string | No | — | Start date `YYYY-MM-DD` |
| `end_date` | string | No | — | End date `YYYY-MM-DD` |
| `include_domains` | string[] | No | — | Only return results from these domains |
| `exclude_domains` | string[] | No | — | Exclude results from these domains |

### `novada_extract`

Extract the main content from any URL. Supports batch extraction of multiple URLs in parallel.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string \| string[] | Yes | — | URL or array of URLs (max 10 for batch) |
| `format` | string | No | `"markdown"` | `markdown` `text` `html` |
| `query` | string | No | — | Query context hint for agent-side filtering |

### `novada_crawl`

Crawl a website and extract content from multiple pages concurrently.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | Yes | — | Seed URL |
| `max_pages` | number | No | `5` | Max pages (1-20) |
| `strategy` | string | No | `"bfs"` | `bfs` (breadth-first) or `dfs` (depth-first) |
| `select_paths` | string[] | No | — | Regex patterns — only crawl matching paths |
| `exclude_paths` | string[] | No | — | Regex patterns — skip matching paths |
| `instructions` | string | No | — | Natural-language hint for agent-side filtering |

### `novada_map`

Discover all URLs on a website. Fast — collects links without extracting content.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | Yes | — | Root URL |
| `search` | string | No | — | Filter URLs by search term |
| `limit` | number | No | `50` | Max URLs (1-100) |
| `max_depth` | number | No | `2` | BFS depth limit (1-5) |
| `include_subdomains` | boolean | No | `false` | Include subdomain URLs |

### `novada_research`

Multi-step web research. Runs 3-10 parallel searches, deduplicates, returns a cited report.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `question` | string | Yes | — | Research question (min 5 chars) |
| `depth` | string | No | `"auto"` | `auto` `quick` `deep` `comprehensive` |
| `focus` | string | No | — | Narrow sub-query focus (e.g. `"production use cases"`) |

---

## Use Cases

| Use Case | Tools | How It Works |
|----------|-------|-------------|
| **RAG pipeline** | `search` + `extract` | Search → extract full text → vector DB |
| **Agentic research** | `research` | One call → multi-source report with citations |
| **Real-time grounding** | `search` | Facts beyond training cutoff |
| **Competitive intel** | `crawl` + `extract` | Crawl competitor sites → extract changes |
| **Lead generation** | `search` | Structured company/product lists |
| **SEO tracking** | `search` | Keywords across 5 engines, 195 countries |
| **Site audit** | `map` | Discover all pages before extracting |
| **Fact-checking** | `search` | Claim → evidence search → verdict |

---

## Why Novada?

| Feature | Novada | Tavily | Firecrawl | Brave Search |
|---------|--------|--------|-----------|-------------|
| Web search | **5 engines** | 1 engine | 1 engine | 1 engine |
| URL extraction | Yes | Yes | Yes | No |
| Website crawling | BFS/DFS | Yes | Yes (async) | No |
| URL mapping | Yes | Yes | Yes | No |
| Research | Yes | Yes | No | No |
| Geo-targeting | **195 countries** | Country param | No | Country param |
| Anti-bot | Proxy (100M+ IPs) | No | Browser (headless Chrome) | No |
| **CLI** | **`nova` command** | No | No | No |

---

## Prerequisites

- **API key** — [Sign up free at novada.com](https://www.novada.com/)
- **Node.js** v18+

---

## 中文文档

<details>
<summary><strong>点击展开完整中文文档</strong></summary>

### 简介

Novada MCP Server 是一个模型上下文协议 (MCP) 服务器，让 AI 代理实时访问互联网 — 搜索、提取、爬取、映射和研究网络内容。所有请求通过 Novada 的代理基础设施（1亿+ IP，195 个国家，反机器人绕过）路由。

### 快速开始

```bash
npm install -g novada-mcp
export NOVADA_API_KEY=你的密钥    # 在 novada.com 免费获取

nova search "杜塞尔多夫最好的甜点" --country de
nova extract https://example.com
nova map https://docs.example.com --search "api"
nova research "AI 代理如何使用网络抓取？" --depth deep
```

### 连接到 Claude Code

```bash
claude mcp add novada -e NOVADA_API_KEY=你的密钥 -- npx -y novada-mcp
```

### 工具

| 工具 | 功能 | 参数 |
|------|------|------|
| `novada_search` | 通过 5 个搜索引擎搜索网络 | `query` (必填), `engine`, `num`, `country`, `language`, `time_range`, `include_domains`, `exclude_domains` |
| `novada_extract` | 从一个或多个 URL 提取主要内容（支持批量） | `url` (必填，支持数组), `format`, `query` |
| `novada_crawl` | 爬取网站并发提取多页内容 | `url` (必填), `max_pages`, `strategy`, `select_paths`, `exclude_paths`, `instructions` |
| `novada_map` | 发现网站所有 URL（不提取内容） | `url` (必填), `search`, `limit`, `max_depth` |
| `novada_research` | 多步骤研究，返回带引用的报告 | `question` (必填), `depth` (`auto`/`quick`/`deep`/`comprehensive`), `focus` |

### 用例

| 用例 | 工具 | 说明 |
|------|------|------|
| RAG 数据管道 | `search` + `extract` | 搜索 → 提取全文 → 向量数据库 |
| 智能研究 | `research` | 一次调用 → 多源综合报告 |
| 实时知识 | `search` | 获取训练截止日期之后的事实 |
| 竞品分析 | `crawl` + `extract` | 爬取竞品网站 → 提取变化 |
| 获客线索 | `search` | 结构化的公司/产品列表 |
| SEO 追踪 | `search` | 跨 5 个引擎、195 个国家追踪关键词 |

### 为什么选择 Novada？

| 特性 | Novada | Tavily | Firecrawl |
|------|--------|--------|-----------|
| 搜索引擎 | **5 个** | 1 个 | 1 个 |
| 地理定向 | **195 个国家** | 国家参数 | 无 |
| 反机器人 | 代理 (1亿+ IP) | 无 | 浏览器 |
| CLI 工具 | **`nova` 命令** | 无 | 无 |

### 前置要求

- **API 密钥** — [在 novada.com 免费注册](https://www.novada.com/)
- **Node.js** v18+

</details>

---

## About

[Novada](https://www.novada.com/) — web data infrastructure for developers and AI agents. 100M+ proxy IPs, 195 countries.

## License

MIT
