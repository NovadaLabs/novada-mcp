# novada

> 一个 MCP 服务器，搞定所有网络数据。搜索、抓取、爬取、代理、AI 研究 — 一条 `npx` 命令搞定。

[![npm version](https://img.shields.io/npm/v/novada-mcp)](https://www.npmjs.com/package/novada-mcp)
[![npm downloads](https://img.shields.io/npm/dm/novada-mcp)](https://www.npmjs.com/package/novada-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 问题所在

AI 智能体需要网络数据，但现有工具太碎片化：

- **Tavily** 能搜索，但不能抓取或代理
- **Firecrawl** 能抓取，但不能搜索或代理
- **BrightData** 什么都能做，但 69 个工具会把你的上下文窗口撑爆
- **自己搭建** 意味着要维护代理、反爬虫绕过、重试逻辑和十几个不同的 API

## 解决方案

```bash
npx novada-mcp
```

一个服务器。一个 API key。覆盖 AI 智能体所有网络数据需求的工具集：

| 需求 | 工具 | 功能 |
|------|------|------|
| 查找信息 | `novada_search` | 支持 Google、Bing、DuckDuckGo、Yandex、Yahoo 的网络搜索 |
| 读取页面 | `novada_extract` | 任意 URL → 干净的 Markdown，支持最多 10 个并行批量处理 |
| 深度研究 | `novada_research` | 一次调用 → 并行搜索 → 去重 → 带引用的多源研究报告 |
| 爬取站点 | `novada_crawl` | BFS/DFS 爬取，最多 20 页，支持正则路径过滤 |
| 发现 URL | `novada_map` | Sitemap + BFS 发现，不读取内容 |
| 平台数据 | `novada_scrape` | Amazon、LinkedIn、TikTok、GitHub、Zillow — 129 个平台 |
| 监控变化 | `novada_monitor` | 在多次检查之间追踪价格/内容/可用性变化 |
| 核实声明 | `novada_verify` | 对照实时网络来源并行核实事实 |
| 原始 HTML | `novada_unblock` | JS 渲染或完整浏览器 CDP，用于有反爬保护的页面 |
| 浏览器自动化 | `novada_browser` | 在云端浏览器中导航、点击、输入、填写表单、截图 |
| 浏览器流程 | `novada_browser_flow` | 多步骤浏览器自动化序列 |
| 代理凭证 | `novada_proxy` | 住宅、手机、ISP、数据中心、静态、专属 — 195 个国家 |
| AI 品牌监控 | `novada_ai_monitor` | 查看 ChatGPT、Perplexity、Grok、Claude、Gemini 如何提及你的品牌 |
| 健康检查 | `novada_health` | 检查你的 key 上哪些 API 产品已激活 |
| 异步抓取 | `novada_scraper_submit` | 提交异步抓取任务 → 轮询 → 获取结果 |

## 核心亮点

**`novada_research` 独一无二。** 没有其他 MCP 服务器能把一个问题变成带引用的多源研究报告。它并行在 Google、Bing 和 DuckDuckGo 上搜索，去重，从前 5 个来源提取完整内容，并综合带引用的结果。一次工具调用取代整个研究工作流。深度选项：quick（3 个查询）、deep（5-6 个）、comprehensive（8-10 个）。

**自动升级处理反爬虫。** 静态获取 → JS 渲染 → 浏览器 CDP。已知高难目标（Amazon、LinkedIn、G2、Zillow、Glassdoor、Walmart、Instagram、TikTok、Shein）根据 30+ 域名注册表直接跳到正确的方法。你不需要考虑 Cloudflare、DataDome、Kasada 或 PerimeterX — 工具会自动处理。

**智能体优先设计（基准分 8.5/10）。** 每个响应都包含结构化的下一步指导 `agent_instruction`、`source` 字段（live/cache/wayback）、带 `failure_class` 的结构化错误、建议更优替代方案的跨工具提示，以及带机器可解析状态码的 `## Agent Action` 块。

## 快速开始

1. 在 [novada.com](https://www.novada.com) 获取 API key

2. 添加到你的 MCP 客户端：

**Claude Code：**
```bash
claude mcp add novada -e NOVADA_API_KEY=your_key -- npx -y novada-mcp
```

**Claude Desktop / Cursor / VS Code / Windsurf：**
```json
{
  "mcpServers": {
    "novada": {
      "command": "npx",
      "args": ["-y", "novada-mcp"],
      "env": { "NOVADA_API_KEY": "your_key" }
    }
  }
}
```

3. 试一试：
```
novada_search({query: "Claude MCP 教程", num: 5})
novada_research({question: "MCP 服务器是如何工作的？", depth: "deep"})
novada_extract({url: "https://news.ycombinator.com", format: "markdown"})
novada_monitor({url: "https://amazon.com/dp/B09...", fields: ["price", "availability"]})
```

## 工具参考

### 搜索与研究

| 工具 | 用途 | 主要参数 | 示例 |
|------|------|---------|------|
| `novada_search` | 通过 5 个引擎进行网络搜索 | `query`, `engine`, `num`, `time_range`, `include_domains` | `novada_search({query: "最佳 API 网关 2026", engine: "google", num: 10})` |
| `novada_research` | 多源并行研究 | `question`, `depth`, `focus` | `novada_research({question: "Kong vs Traefik vs APISIX", depth: "comprehensive", focus: "性能基准"})` |
| `novada_verify` | 对照网络核实声明 | `claim` | `novada_verify({claim: "GPT-5 于 2026 年发布"})` |

### 提取与爬取

| 工具 | 用途 | 主要参数 | 示例 |
|------|------|---------|------|
| `novada_extract` | 从 URL 提取内容（支持批量） | `url`（单个或数组）, `format`, `render`, `fields` | `novada_extract({url: "https://example.com", fields: ["price", "rating"]})` |
| `novada_crawl` | 从域名爬取多页 | `url`, `max_pages`, `strategy`, `select_paths` | `novada_crawl({url: "https://docs.example.com", max_pages: 10, select_paths: "/api/.*"})` |
| `novada_map` | 发现站点上的 URL | `url`, `search`, `limit` | `novada_map({url: "https://example.com", search: "pricing"})` |
| `novada_monitor` | 随时间检测页面变化 | `url`, `fields` | `novada_monitor({url: "https://amazon.com/dp/B09...", fields: ["price"]})` |

### 结构化平台数据

`novada_scrape` 支持 129 个平台的结构化数据提取，返回干净的表格记录，而非原始 HTML。

| 平台 | 操作示例 | 返回数据 |
|------|---------|---------|
| Amazon | `amazon_product_keywords`, `amazon_product_asin` | 标题、价格、评分、评论、BSR、库存 |
| LinkedIn | `linkedin_company_information_url`, `linkedin_profile_url` | 公司信息、员工数、个人资料 |
| TikTok | `tiktok_posts_url`, `tiktok_profile_url` | 视频统计、互动、个人资料 |
| GitHub | `github_repository_repo-url` | Star 数、Fork 数、Issues、描述、语言 |
| Reddit | `reddit_subreddit_posts` | 帖子、分数、评论、时间戳 |
| Zillow | `zillow_property_url` | 价格、卧室数、浴室数、面积、Zestimate |
| Glassdoor | `glassdoor_company_reviews_url` | 评价、评分、薪资数据 |
| YouTube | `youtube_video_search_label` | 视频标题、播放量、时长、频道 |
| Instagram | `instagram_profile_url` | 帖子、粉丝、互动 |
| Google Shopping | `google_shopping_search` | 商品、价格、商家 |

完整平台列表：调用 `novada_discover` 或读取 `novada://scraper-platforms` MCP 资源。

### 代理网络

通过 Novada 的代理基础设施路由你自己的 HTTP 请求。1 亿+ IP，覆盖 195 个国家。

| 工具 | 代理类型 | 最适合 |
|------|---------|--------|
| `novada_proxy_residential` | 真实家庭 ISP IP | 反爬虫绕过、地理限制内容 |
| `novada_proxy_isp` | ISP 分配 IP | 社交媒体、电商平台 |
| `novada_proxy_datacenter` | 数据中心 IP | 大批量、无保护目标 |
| `novada_proxy_mobile` | 4G/5G 手机 IP | 移动端内容、App API |
| `novada_proxy_static` | 专属静态 ISP IP | 账户管理、登录流程 |
| `novada_proxy_dedicated` | 独享数据中心 IP | 高信任平台、干净声誉 |

每个代理工具以 `url`、`env` 或 `curl` 格式返回连接凭证。参数：`country`（ISO 2 字母代码）、`city`（可选）、`session_id`（粘性会话）。

### 浏览器自动化

| 工具 | 用途 | 示例 |
|------|------|------|
| `novada_browser` | 通过 CDP 进行完整浏览器交互 | `novada_browser({actions: [{type: "navigate", url: "..."}, {type: "click", selector: "#btn"}]})` |
| `novada_browser_flow` | 多步骤自动化序列 | 点击、滚动、等待、输入、截图 — 每次调用最多 20 个动作 |
| `novada_unblock` | 从受保护页面获取原始渲染 HTML | `novada_unblock({url: "...", method: "browser"})` |

通过 `session_id` 跨调用保持会话。Cookie、登录状态和页面上下文都会保留。

## 使用场景

### AI 智能体研究与 RAG 管道
```
novada_research({question: "量子计算的最新进展是什么？", depth: "comprehensive"})
```
返回带引用的多源报告。可直接输入 RAG 向量存储或用作智能体推理的上下文。

### 电商价格监控
```
novada_monitor({url: "https://amazon.com/dp/B0XXXXXX", fields: ["price", "availability"]})
```
第一次调用记录基准值。之后再次调用 — 返回字段级别的差异，带百分比变化（例如，price: $999 → $899，↓10%）。

### 竞品情报
```
novada_scrape({platform: "amazon.com", operation: "amazon_product_keywords", params: {keyword: "wireless earbuds"}, limit: 20})
```
获取结构化商品数据（价格、评分、评论、BSR），用于跨 129 个平台的竞品分析。

### 线索获取
```
novada_scrape({platform: "linkedin.com", operation: "linkedin_company_information_url", params: {url: "https://linkedin.com/company/..."}, limit: 1})
```
从 LinkedIn 公司页面提取公司信息、员工数和行业数据。

### LLM 训练内容提取
```
novada_crawl({url: "https://docs.example.com", max_pages: 20, select_paths: "/docs/.*"})
```
爬取文档站点，提取干净的 Markdown，用于微调数据集或知识库。

### AI 品牌监控
```
novada_ai_monitor({brand: "YourProduct", models: ["chatgpt", "perplexity", "claude"]})
```
查看 AI 模型如何引用你的品牌：情感倾向、声明、竞品提及、来源 URL。

### 地理定向数据采集
```
novada_proxy_residential({country: "CN", city: "shanghai", format: "curl"})
```
获取 195 个国家任意位置的代理凭证。配合你自己的 HTTP 客户端访问特定地区的内容。

## 客观对比

|  | Novada | Firecrawl | Tavily | BrightData |
|---|---|---|---|---|
| 工具数量 | 25 | 14 | 2 | 69 |
| 搜索引擎 | 5 | 0 | 1 | 3 |
| 多源研究 | **有** | 无 | 无 | 无 |
| 代理作为 MCP 工具 | **有** | 无 | 无 | 无 |
| 自动反爬升级 | **有** | 无 | N/A | 无 |
| 变化监控 | **有** | 无 | 无 | 无 |
| 平台结构化抓取 | 129 个平台 | 无 | 无 | 437 个平台 |
| 浏览器自动化 | **有**（CDP）| 无 | 无 | 有 |
| MCP Prompts & Resources | **有**（5+4）| 无 | 无 | 无 |
| 托管 MCP（免安装）| **暂无** | 无 | 无 | 有 |
| 智能体优先评分 | 8.5/10 | 6.0 | 6.0 | N/A |

> **目前暂缺：** 托管 HTTP 端点（目前需要终端安装），部分 Scraper API 平台需要单独激活。BrightData 有更多结构化爬虫（437 vs 129）。

## 反爬支持

Novada 通过自动升级链自动处理以下反爬虫系统：

| 反爬系统 | 检测方式 | 升级方法 |
|---------|---------|---------|
| Cloudflare | `cf_chl_`、`__cf_bm`、挑战页面 | 通过 Web Unblocker 自动渲染 |
| DataDome | `datadome` cookie/脚本 | 自动渲染 |
| Kasada | 脚本路径检测 | 浏览器 CDP |
| PerimeterX | `_px` cookie 变体 | 自动渲染 |
| Akamai | `_abck`、`ak_bmsc` cookie | 自动渲染 |
| Imperva/Incapsula | `incap_ses_`、`visid_incap_` | 自动渲染 |

30+ 个域名已在硬目标注册表中预标记 — 这些域名完全跳过静态获取，直接使用正确的方法。

## 配置

| 变量 | 是否必须 | 用途 |
|------|---------|------|
| `NOVADA_API_KEY` | **必须** | API key — 覆盖搜索、提取、爬取、抓取、研究、核实、监控 |
| `NOVADA_BROWSER_WS` | 否 | `novada_browser` 和 `novada_browser_flow` 的浏览器 API WebSocket URL |
| `NOVADA_PROXY_USER` | 否 | `novada_proxy_*` 工具的代理用户名 |
| `NOVADA_PROXY_PASS` | 否 | 代理密码 |
| `NOVADA_PROXY_ENDPOINT` | 否 | 代理 host:port 端点 |
| `NOVADA_WEB_UNBLOCKER_KEY` | 否 | Web Unblocker 单独 key（与主 API key 不同时使用）|
| `NOVADA_TOOLS` | 否 | 只加载指定工具：`"extract,search,research,monitor"` |
| `NOVADA_GROUPS` | 否 | 按组加载工具：`"search,proxy,browser"` — 组别：search, proxy, browser, scraper, health |

## 链接

- 文档 + API key：[novada.com](https://www.novada.com)
- npm：[npmjs.com/package/novada-mcp](https://www.npmjs.com/package/novada-mcp)
- GitHub：[github.com/NovadaLabs/novada-mcp](https://github.com/NovadaLabs/novada-mcp)
- Issues：[github.com/NovadaLabs/novada-mcp/issues](https://github.com/NovadaLabs/novada-mcp/issues)
- 工具详情：从任意 MCP 客户端调用 `novada_discover` 或 `novada_health`

## 语言

[English](README.md) · 中文

## 许可证

MIT
