# Novada 后端 — 关键问题报告
**来自：** Novada MCP 团队 | **日期：** 2026-04-22
**背景：** 122 次实时测试调用，与 Tavily MCP + Firecrawl MCP 的竞品对标
**紧急程度：** 高 — 这些问题导致 Novada 在 AI Agent 市场失去竞争力

---

## 摘要

我们为 AI Agent（Claude、Cursor、VS Code 等）构建了 Novada API 的 MCP 服务器封装。经过 122 次实时测试，发现 **7 个后端问题**阻碍我们与 Tavily 和 Firecrawl 竞争。五个搜索引擎中有四个不可用。URL 抓取的代理端点返回 404。缺少地理定位导致返回错误语言的内容。

AI Agent MCP 市场发展极快。Tavily 已经有 AI 智能排序。Firecrawl 已经有自主浏览器 Agent。**如果 Novada 的后端问题不修复，无论我们的 MCP 封装层做得多好，Agent 都会转向竞品。**

---

## 问题 1：严重 — scraperapi.novada.com/search 五个搜索引擎中四个不可用

### 现象

| 引擎 | 错误 | 测试次数 | 成功率 |
|------|------|---------|--------|
| Google | 正常（仅限串行调用） | 31 次 | ~33%（串行 100%，并行 0%） |
| Bing | 查询参数被静默丢弃 → 返回无关结果 | 7 次 | 0%（结果全部错误） |
| DuckDuckGo | 所有调用返回 `API_DOWN` | 7 次 | 0% |
| Yahoo | `410: empty query built` | 7 次 | 0% |
| Yandex | `INVALID_API_KEY` | 7 次 | 0% |

### 证据

**Yahoo：** 我们发送 `GET /search?q=vector+databases+comparison+2025&engine=yahoo&api_key=...`。返回：`{code: 410, msg: "Build url error: empty query built"}`。`q` 参数已正确编码传递，但后端 URL 构建器丢弃了该参数。

**Bing：** 我们发送 `q=LLM+fine-tuning+techniques+comparison`。返回的 10 条结果全部是关于"大语言模型"的通用内容，没有一条与"微调"相关。查询字符串被静默忽略，后端似乎执行了默认/兜底查询。

**DuckDuckGo：** 所有调用均返回 `API_DOWN`。在数小时内独立测试了 3 轮，结果一致。可能是 Novada 的 IP 被 DDG 屏蔽，或 DDG 的工作节点未启动。

**Yandex：** 返回 `INVALID_API_KEY` — 该账户似乎没有配置 Yandex Search API 密钥。

**Google（并行调用）：** 同时发起 2 个以上 Google 搜索时，全部失败并返回 `413: WorkerPool not initialized`。串行调用正常。工作线程池不支持并发。

### 竞品影响

Tavily 和 Firecrawl 各自只提供一个搜索引擎，但 100% 可用。我们宣传支持 5 个引擎，实际只有 1 个（Google 串行）能用。**Agent 会在 2-3 次失败后永久放弃非 Google 引擎。**

### 需要修复

1. 修复 Yahoo URL 构建器 — `q` 参数被丢弃
2. 修复 Bing 查询透传 — 查询字符串被静默丢失
3. 恢复 DuckDuckGo 工作节点或解封 IP
4. 为 Yandex 配置 API 密钥，或从 API 中移除该引擎
5. 扩容 Google WorkerPool 至少支持 5 个并发请求

---

## 问题 2：严重 — scraperapi.novada.com 根路径返回 404

### 现象

`GET https://scraperapi.novada.com?api_key=...&url=https://example.com` 返回 HTTP 404。

只有 `/search` 子路径可用。根路径（用于 URL 抓取/内容提取）完全不可用。

### 影响

整个 extract/crawl/map 的代理链路静默失效。测试中所有"成功"的提取/爬取调用实际上都是回退到了直接抓取（没有经过代理）。这意味着：
- 没有任何反机器人绕过能力
- 没有住宅 IP 轮换
- 屏蔽数据中心 IP 的网站会静默失败

我们已用 Web Unblocker（`POST webunlocker.novada.com/request`）作为临时方案，但这不应该是主要通道 — 成本更高、速度更慢。

### 需要修复

修复 scraperapi 根端点，或提供一个有文档的替代端点（使用相同的 API Key）来做 URL 抓取。

---

## 问题 3：中等 — scraperapi 代理缺少地理定位

### 现象

代理出口 IP 位于欧盟（可能是德国）。当 Agent 提取美国网站（如 stripe.com）时，会被重定向到本地化页面：
- `stripe.com/pricing` → `stripe.com/de/pricing` → 144 字符，德语，"Preise und Gebühren"
- 预期：英文定价页面，~5000+ 字符

### 证据

用 Web Unblocker 访问相同 URL，返回正确的美式英语内容（918KB）。所以 Novada 有能力返回美国内容 — 只是 scraperapi 没有默认使用。

### 需要修复

在 scraperapi 代理端点添加 `country` 参数（搜索端点已有该参数）。对英语请求默认使用 `us`。

---

## 竞争紧迫性

### 市场态势

MCP（Model Context Protocol）服务器市场是 AI Agent 访问网络数据的主要渠道。三家厂商正在竞争：

| 能力维度 | Novada（现状） | Tavily | Firecrawl |
|---------|---------------|--------|-----------|
| 搜索引擎 | 1 个可用（Google） | 1 个（稳定） | 1 个（稳定） |
| 搜索质量 | Google 原始排序 | AI 智能排序 | 77% 覆盖率 |
| 提取可靠性 | ~50%（代理不可用） | 高 | 高 |
| 浏览器 Agent | 无 | 无 | FIRE-1（点击、填表、CAPTCHA） |
| 结构化提取 | 无 | 无 | JSON Schema |
| 异步爬取 | 无 | 部分支持 | 完整（Job ID + 轮询） |
| Agent 引导提示 | **Agent Hints（独有）** | 无 | 无 |

### 时间窗口

Novada 的 Agent Hints 概念是独特且有价值的。**没有竞品会在每次响应中告诉 Agent 下一步该做什么。** 这是真正的差异化优势 — 但前提是底层数据必须可靠。

如果 5 个搜索引擎全部可用，Novada 将是需要地理多样性和引擎多样性的 Agent 的首选。如果代理端点正常工作，Novada 的提取/爬取在覆盖率上会具有竞争力。

**这些都是后端基础设施问题，不是产品重新设计。修复窗口就是现在 — 在 Agent 形成对 Tavily/Firecrawl 的永久偏好之前。**

---

## 复现方法

所有问题均可通过以下命令复现：

```bash
# Yahoo 410
curl "https://scraperapi.novada.com/search?q=test+query&engine=yahoo&api_key=YOUR_KEY"

# Bing 查询丢失
curl "https://scraperapi.novada.com/search?q=specific+technical+query&engine=bing&api_key=YOUR_KEY"
# 对比真实 Bing 搜索结果 — 会发现完全不匹配

# DDG 不可用
curl "https://scraperapi.novada.com/search?q=test&engine=duckduckgo&api_key=YOUR_KEY"

# Yandex 无密钥
curl "https://scraperapi.novada.com/search?q=test&engine=yandex&api_key=YOUR_KEY"

# 根路径 404
curl "https://scraperapi.novada.com?url=https://example.com&api_key=YOUR_KEY"
```

---

*我们致力于让 Novada 成为最好的网络数据 MCP。这些后端修复加上我们 MCP 层的改进，可以在数周内让 Novada 在与 Tavily 和 Firecrawl 的竞争中达到同等甚至更优的水平。*
