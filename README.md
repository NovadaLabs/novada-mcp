<p align="center">
  <h1 align="center">Novada MCP Server</h1>
  <p align="center"><strong>Search, extract, crawl, map, and research the web — from any AI agent or terminal.</strong></p>
  <p align="center">Powered by <a href="https://www.novada.com">novada.com</a> — 100M+ proxy IPs across 195 countries.</p>
</p>

<p align="center">
  <a href="https://www.novada.com"><img src="https://img.shields.io/badge/novada.com-API_Key-ff6b35?style=for-the-badge" alt="novada.com"></a>
  <a href="https://www.npmjs.com/package/novada-mcp"><img src="https://img.shields.io/npm/v/novada-mcp?style=for-the-badge&label=MCP&color=blue" alt="npm version"></a>
  <a href="https://lobehub.com/mcp/goldentrii-novada-mcp"><img src="https://img.shields.io/badge/LobeHub-MCP-purple?style=for-the-badge" alt="LobeHub MCP"></a>
  <a href="https://smithery.ai/server/novada-mcp"><img src="https://img.shields.io/badge/Smithery-install-8B5CF6?style=for-the-badge" alt="Smithery"></a>
  <a href="#tools"><img src="https://img.shields.io/badge/tools-5-brightgreen?style=for-the-badge" alt="5 tools"></a>
  <a href="#novada_search"><img src="https://img.shields.io/badge/engines-5-orange?style=for-the-badge" alt="5 engines"></a>
  <a href="#nova--cli"><img src="https://img.shields.io/badge/CLI-nova-blueviolet?style=for-the-badge" alt="CLI nova"></a>
  <a href="https://www.novada.com"><img src="https://img.shields.io/badge/proxy_IPs-100M+-red?style=for-the-badge" alt="100M+ proxy IPs"></a>
  <a href="https://www.novada.com"><img src="https://img.shields.io/badge/countries-195-cyan?style=for-the-badge" alt="195 countries"></a>
  <img src="https://img.shields.io/badge/tests-117-green?style=for-the-badge" alt="117 tests">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge" alt="MIT License"></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/novada-mcp"><img src="https://img.shields.io/npm/dt/novada-mcp" alt="downloads"></a>
  <a href="https://github.com/Goldentrii/novada-mcp"><img src="https://img.shields.io/github/stars/Goldentrii/novada-mcp?style=social" alt="stars"></a>
</p>


---

<p align="center">
  <strong>Language / 语言：</strong>
  <a href="#english-docs">English</a> · <a href="#中文文档">中文</a>
</p>

---

<h2 id="english-docs">English</h2>

**Jump to:** [Quick Start](#quick-start) · [Tools](#tools) · [Prompts](#prompts) · [Resources](#resources) · [Examples](#real-output-examples) · [Use Cases](#use-cases) · [Comparison](#why-novada)

---

### `nova` — CLI

```bash
npm install -g novada-mcp
export NOVADA_API_KEY=your-key    # Free at novada.com
```

```bash
nova search "best desserts in Düsseldorf" --country de
nova search "AI funding news" --time week --include "techcrunch.com,wired.com"
nova extract https://example.com
nova crawl https://docs.example.com --max-pages 10 --select "/api/.*"
nova map https://docs.example.com --search "webhook" --max-depth 3
nova research "How do AI agents use web scraping?" --depth deep --focus "production use cases"
```

---

### Real Output Examples

#### `nova search "best desserts in Düsseldorf" --country de`

```
## Search Results
results:3 | engine:google | country:de

---

### 1. THE BEST Dessert in Düsseldorf
url: https://www.tripadvisor.com/Restaurants-g187373-zfg9909-Dusseldorf...
snippet: Heinemann Konditorei Confiserie (4.4★), Eis-Café Pia (4.5★), Cafe Huftgold (4.3★)

### 2. Top 10 Best Desserts Near Dusseldorf
url: https://www.yelp.com/search?cflt=desserts&find_loc=Dusseldorf...
snippet: Namu Café, Pure Pastry, Tenten Coffee, Eiscafé Pia...

### 3. Good Dessert Spots : r/duesseldorf
url: https://www.reddit.com/r/duesseldorf/comments/1mxh4bj/...
snippet: "I'm moving to Düsseldorf soon and I love trying out desserts!"

---
## Agent Hints
- To read any result in full: `novada_extract` with its url
- To batch-read multiple results: `novada_extract` with `url=[url1, url2, ...]`
- For deeper multi-source research: `novada_research`
```

#### `nova research "How do AI agents use web scraping?" --depth deep`

```
## Research Report
question: "How do AI agents use web scraping?"
depth:deep (auto-selected) | searches:6 | results:28 | unique_sources:15

---

## Search Queries Used
1. How do AI agents use web scraping?
2. ai agents web scraping overview explained
3. ai agents web scraping vs alternatives comparison
4. ai agents web scraping best practices real world
5. ai agents web scraping challenges limitations
6. "ai" "agents" site:reddit.com OR site:news.ycombinator.com

## Key Findings
1. **How AI Agents Are Changing the Future of Web Scraping**
   https://medium.com/@davidfagb/...
   These agents can think, understand, and adjust to changes in web structure...

## Sources
1. [How AI Agents Are Changing Web Scraping](https://medium.com/...)

---
## Agent Hints
- 15 sources found. Extract the most relevant with: `novada_extract` with url=[url1, url2]
- For more coverage: use depth='comprehensive' (8-10 searches).
```

#### Map → Batch Extract Workflow

```bash
# Step 1: Discover pages
nova map https://docs.example.com --search "webhook" --max-depth 3

# Step 2: Batch-extract multiple pages in one call
nova extract https://docs.example.com/webhooks/events https://docs.example.com/webhooks/retry
```

---

### Quick Start

#### Claude Code (1 command)

```bash
claude mcp add novada -e NOVADA_API_KEY=your-key -- npx -y novada-mcp
```

`--scope user` for all projects:
```bash
claude mcp add --scope user novada -e NOVADA_API_KEY=your-key -- npx -y novada-mcp
```

#### Smithery (1 click)

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

### Tools

#### `novada_search`

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

#### `novada_extract`

Extract the main content from any URL. Supports batch extraction of multiple URLs in parallel.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string \| string[] | Yes | — | URL or array of URLs (max 10 for batch) |
| `format` | string | No | `"markdown"` | `markdown` `text` `html` |
| `query` | string | No | — | Query context hint for agent-side filtering |

#### `novada_crawl`

Crawl a website and extract content from multiple pages concurrently.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | Yes | — | Seed URL |
| `max_pages` | number | No | `5` | Max pages (1-20) |
| `strategy` | string | No | `"bfs"` | `bfs` (breadth-first) or `dfs` (depth-first) |
| `select_paths` | string[] | No | — | Regex patterns — only crawl matching paths |
| `exclude_paths` | string[] | No | — | Regex patterns — skip matching paths |
| `instructions` | string | No | — | Natural-language hint for agent-side filtering |

#### `novada_map`

Discover all URLs on a website. Fast — collects links without extracting content.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | Yes | — | Root URL |
| `search` | string | No | — | Filter URLs by search term |
| `limit` | number | No | `50` | Max URLs (1-100) |
| `max_depth` | number | No | `2` | BFS depth limit (1-5) |
| `include_subdomains` | boolean | No | `false` | Include subdomain URLs |

#### `novada_research`

Multi-step web research. Runs 3-10 parallel searches, deduplicates, returns a cited report.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `question` | string | Yes | — | Research question (min 5 chars) |
| `depth` | string | No | `"auto"` | `auto` `quick` `deep` `comprehensive` |
| `focus` | string | No | — | Narrow sub-query focus (e.g. `"production use cases"`) |

---

### Prompts

MCP prompts are pre-built workflow templates visible in supported clients (Claude Desktop, LobeChat, etc.).

| Prompt | Description | Arguments |
|--------|-------------|-----------|
| `research_topic` | Deep multi-source research with optional country and focus | `topic` (required), `country`, `focus` |
| `extract_and_summarize` | Extract one or more URLs and summarize | `urls` (required), `focus` |
| `site_audit` | Map site structure then extract key sections | `url` (required), `sections` |

---

### Resources

Read-only data agents can access before deciding which tool to call.

| URI | Description |
|-----|-------------|
| `novada://engines` | All 5 engines with characteristics and use cases |
| `novada://countries` | 195 country codes for geo-targeted search |
| `novada://guide` | Decision tree for choosing between tools |

---

### Use Cases

| Use Case | Tools | How It Works |
|----------|-------|-------------|
| **RAG pipeline** | `search` + `extract` | Search → batch-extract full text → vector DB |
| **Agentic research** | `research` | One call → multi-source report with citations |
| **Real-time grounding** | `search` | Facts beyond training cutoff |
| **Competitive intel** | `crawl` | Crawl competitor sites → extract changes |
| **Lead generation** | `search` | Structured company/product lists |
| **SEO tracking** | `search` | Keywords across 5 engines, 195 countries |
| **Site audit** | `map` → `extract` | Discover pages, then batch-extract targets |
| **Domain filtering** | `search` | `include_domains` to restrict to trusted sources |
| **Trend monitoring** | `search` | `time_range=week` for recent-only results |

---

### Why Novada?

| Feature | Novada | Tavily | Firecrawl | Brave Search |
|---------|--------|--------|-----------|-------------|
| Web search | **5 engines** | 1 engine | 1 engine | 1 engine |
| URL extraction | Yes | Yes | Yes | No |
| Batch extraction | **Yes (10 URLs)** | No | Yes | No |
| Website crawling | BFS/DFS | Yes | Yes (async) | No |
| URL mapping | Yes | Yes | Yes | No |
| Research | Yes | Yes | No | No |
| MCP Prompts | **3** | No | No | No |
| MCP Resources | **3** | No | No | No |
| Geo-targeting | **195 countries** | Country param | No | Country param |
| Domain filtering | **include/exclude** | No | No | No |
| Anti-bot | Proxy (100M+ IPs) | No | Headless Chrome | No |
| **CLI** | **`nova` command** | No | No | No |

---

### Prerequisites

- **API key** — [Sign up free at novada.com](https://www.novada.com/)
- **Node.js** v18+

---

<h2 id="中文文档">中文文档</h2>

**跳转至：** [快速开始](#快速开始) · [工具](#工具) · [Prompts](#prompts-预置工作流) · [Resources](#resources-只读数据) · [示例](#真实输出示例) · [用例](#用例) · [对比](#为什么选择-novada)

---

### 简介

Novada MCP Server 让 AI 代理实时访问互联网 — 搜索、提取、爬取、映射和研究网络内容。所有请求通过 Novada 的代理基础设施（**1亿+ IP，195 个国家，反机器人绕过**）路由。

---

### 快速开始

```bash
npm install -g novada-mcp
export NOVADA_API_KEY=你的密钥    # 在 novada.com 免费获取
```

```bash
nova search "杜塞尔多夫最好的甜点" --country de
nova search "AI 融资新闻" --time week --include "techcrunch.com"
nova extract https://example.com
nova crawl https://docs.example.com --max-pages 10 --select "/api/.*"
nova map https://docs.example.com --search "api" --max-depth 3
nova research "AI 代理如何使用网络抓取？" --depth deep --focus "生产用例"
```

#### 连接到 Claude Code

```bash
claude mcp add novada -e NOVADA_API_KEY=你的密钥 -- npx -y novada-mcp
```

所有项目生效：
```bash
claude mcp add --scope user novada -e NOVADA_API_KEY=你的密钥 -- npx -y novada-mcp
```

#### 通过 Smithery 一键安装

```bash
npx -y @smithery/cli install novada-mcp --client claude
```

<details>
<summary><strong>Cursor / VS Code / Windsurf / Claude Desktop</strong></summary>

**Cursor** — `.cursor/mcp.json`:
```json
{ "mcpServers": { "novada": { "command": "npx", "args": ["-y", "novada-mcp@latest"], "env": { "NOVADA_API_KEY": "你的密钥" } } } }
```

**VS Code** — `.vscode/mcp.json`:
```json
{ "servers": { "novada": { "command": "npx", "args": ["-y", "novada-mcp@latest"], "env": { "NOVADA_API_KEY": "你的密钥" } } } }
```

**Windsurf** — `~/.codeium/windsurf/mcp_config.json`:
```json
{ "mcpServers": { "novada": { "command": "npx", "args": ["-y", "novada-mcp@latest"], "env": { "NOVADA_API_KEY": "你的密钥" } } } }
```

**Claude Desktop** — `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{ "mcpServers": { "novada": { "command": "npx", "args": ["-y", "novada-mcp@latest"], "env": { "NOVADA_API_KEY": "你的密钥" } } } }
```

</details>

---

### 真实输出示例

#### `nova search "杜塞尔多夫最好的甜点" --country de`

```
## Search Results
results:3 | engine:google | country:de

---

### 1. THE BEST Dessert in Düsseldorf
url: https://www.tripadvisor.com/Restaurants-g187373-zfg9909-Dusseldorf...
snippet: Heinemann Konditorei Confiserie (4.4★), Eis-Café Pia (4.5★)

### 2. Top 10 Best Desserts Near Dusseldorf
url: https://www.yelp.com/search?cflt=desserts&find_loc=Dusseldorf...
snippet: Namu Café, Pure Pastry, Tenten Coffee...

---
## Agent Hints
- 完整阅读任一结果：使用 `novada_extract` 传入对应 url
- 批量读取多个结果：`novada_extract` 传入 `url=[url1, url2, ...]`
- 深度多源研究：使用 `novada_research`
```

#### `nova research "AI 代理如何使用网络抓取？" --depth deep`

```
## Research Report
question: "AI 代理如何使用网络抓取？"
depth:deep (auto-selected) | searches:6 | results:28 | unique_sources:15

---

## Search Queries Used
1. AI 代理如何使用网络抓取？
2. ai agents web scraping overview explained
3. ai agents web scraping best practices real world
...

## Key Findings
1. **How AI Agents Are Changing Web Scraping**
   https://medium.com/@davidfagb/...

---
## Agent Hints
- 找到 15 个来源。用 `novada_extract` 提取最相关的页面
- 更多覆盖：使用 depth='comprehensive'（8-10 次搜索）
```

---

### 工具

#### `novada_search` — 网络搜索

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `query` | string | 是 | — | 搜索关键词 |
| `engine` | string | 否 | `"google"` | `google` `bing` `duckduckgo` `yahoo` `yandex` |
| `num` | number | 否 | `10` | 结果数量（1-20） |
| `country` | string | 否 | — | 国家代码（`us` `cn` `de`） |
| `language` | string | 否 | — | 语言代码（`en` `zh` `de`） |
| `time_range` | string | 否 | — | 时间范围：`day` `week` `month` `year` |
| `start_date` | string | 否 | — | 起始日期 `YYYY-MM-DD` |
| `end_date` | string | 否 | — | 截止日期 `YYYY-MM-DD` |
| `include_domains` | string[] | 否 | — | 只返回这些域名的结果 |
| `exclude_domains` | string[] | 否 | — | 排除这些域名的结果 |

#### `novada_extract` — 内容提取

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `url` | string \| string[] | 是 | — | 单个 URL 或 URL 数组（最多 10 个，并行处理） |
| `format` | string | 否 | `"markdown"` | `markdown` `text` `html` |
| `query` | string | 否 | — | 查询上下文，帮助 agent 聚焦相关内容 |

#### `novada_crawl` — 网站爬取

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `url` | string | 是 | — | 起始 URL |
| `max_pages` | number | 否 | `5` | 最大页面数（1-20） |
| `strategy` | string | 否 | `"bfs"` | `bfs`（广度优先）或 `dfs`（深度优先） |
| `select_paths` | string[] | 否 | — | 正则表达式 — 只爬取匹配路径 |
| `exclude_paths` | string[] | 否 | — | 正则表达式 — 跳过匹配路径 |
| `instructions` | string | 否 | — | 自然语言说明，指导 agent 侧语义过滤 |

#### `novada_map` — URL 发现

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `url` | string | 是 | — | 根 URL |
| `search` | string | 否 | — | 按关键词过滤 URL |
| `limit` | number | 否 | `50` | 最多 URL 数（1-100） |
| `max_depth` | number | 否 | `2` | BFS 深度上限（1-5） |
| `include_subdomains` | boolean | 否 | `false` | 是否包含子域名 |

#### `novada_research` — 深度研究

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `question` | string | 是 | — | 研究问题（最少 5 个字符） |
| `depth` | string | 否 | `"auto"` | `auto` `quick` `deep` `comprehensive` |
| `focus` | string | 否 | — | 聚焦方向（如 `"技术实现"` `"市场趋势"`） |

---

### Prompts 预置工作流

MCP Prompts 是预置工作流模板，在支持的客户端（Claude Desktop、LobeChat 等）中可直接选用。

| Prompt | 功能 | 参数 |
|--------|------|------|
| `research_topic` | 对任意主题进行深度多源研究 | `topic`（必填）, `country`, `focus` |
| `extract_and_summarize` | 提取一个或多个 URL 的内容并生成摘要 | `urls`（必填）, `focus` |
| `site_audit` | 映射网站结构，然后提取并汇总关键部分 | `url`（必填）, `sections` |

---

### Resources 只读数据

Agent 在选择工具之前可以读取的参考数据。

| URI | 内容 |
|-----|------|
| `novada://engines` | 5 个搜索引擎的特性和推荐使用场景 |
| `novada://countries` | 195 个国家代码（地理定向搜索） |
| `novada://guide` | 工具选择决策树和工作流模式 |

---

### 用例

| 用例 | 工具 | 说明 |
|------|------|------|
| RAG 数据管道 | `search` + `extract` | 搜索 → 批量提取全文 → 向量数据库 |
| 智能研究 | `research` | 一次调用 → 多源综合带引用报告 |
| 实时知识 | `search` | 获取训练截止日期之后的事实 |
| 竞品分析 | `crawl` | 爬取竞品网站 → 提取内容变化 |
| 获客线索 | `search` | 结构化的公司/产品列表 |
| SEO 追踪 | `search` | 跨 5 个引擎、195 个国家追踪关键词 |
| 网站审计 | `map` → `extract` | 发现所有页面，然后批量提取目标内容 |
| 域名过滤 | `search` | `include_domains` 只搜索可信来源 |
| 趋势监控 | `search` | `time_range=week` 只获取最新结果 |

---

### 为什么选择 Novada？

| 特性 | Novada | Tavily | Firecrawl | Brave Search |
|------|--------|--------|-----------|-------------|
| 搜索引擎数量 | **5 个** | 1 个 | 1 个 | 1 个 |
| URL 内容提取 | 支持 | 支持 | 支持 | 不支持 |
| 批量提取 | **支持（最多 10 个）** | 不支持 | 支持 | 不支持 |
| 网站爬取 | BFS/DFS | 支持 | 支持（异步） | 不支持 |
| URL 发现 | 支持 | 支持 | 支持 | 不支持 |
| 深度研究 | 支持 | 支持 | 不支持 | 不支持 |
| MCP Prompts | **3 个** | 无 | 无 | 无 |
| MCP Resources | **3 个** | 无 | 无 | 无 |
| 地理定向 | **195 个国家** | 国家参数 | 无 | 国家参数 |
| 域名过滤 | **include/exclude** | 无 | 无 | 无 |
| 反机器人 | 代理（1亿+ IP） | 无 | 无头浏览器 | 无 |
| CLI 工具 | **`nova` 命令** | 无 | 无 | 无 |

---

### 前置要求

- **API 密钥** — [在 novada.com 免费注册](https://www.novada.com/)
- **Node.js** v18+

---

## About

[Novada](https://www.novada.com/) — web data infrastructure for developers and AI agents. 100M+ proxy IPs, 195 countries.

## License

MIT
