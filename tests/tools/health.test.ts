import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock fetch globally before importing the module
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock credentials utils
vi.mock("../../src/utils/credentials.js", () => ({
  getBrowserWs: vi.fn(),
  getProxyCredentials: vi.fn(),
}));

import { getBrowserWs, getProxyCredentials } from "../../src/utils/credentials.js";
const mockedGetBrowserWs = vi.mocked(getBrowserWs);
const mockedGetProxyCredentials = vi.mocked(getProxyCredentials);

const { novadaHealth } = await import("../../src/tools/health.js");

const API_KEY = "test-key-abcd";

function makeFetchResponse(status: number, body: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  // Default: all env-based products not configured
  mockedGetBrowserWs.mockReturnValue(undefined);
  mockedGetProxyCredentials.mockReturnValue(null);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("novadaHealth", () => {
  it("shows all active when all HTTP probes return 200 and env vars are set", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ code: 0, data: [] }),
    });
    mockedGetProxyCredentials.mockReturnValue({ user: "u", pass: "p", endpoint: "proxy.example.com:7777" });
    mockedGetBrowserWs.mockReturnValue("wss://user:pass@browser.example.com");

    const result = await novadaHealth(API_KEY);

    expect(result).toContain("✅ Active");
    expect(result).toContain("Search API");
    expect(result).toContain("Web Unblocker / Extract");
    expect(result).toContain("Scraper API (65+ platforms)");
    expect(result).toContain("Proxy");
    expect(result).toContain("Browser API");
    expect(result).toContain("All products active");
  });

  it("shows Not activated for Scraper API when response indicates error code 11006", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/search")) return makeFetchResponse(200, { code: 0 });
      if (url.includes("/extract")) return makeFetchResponse(200, { code: 0 });
      if (url.includes("/scrape")) return makeFetchResponse(400, { code: 11006, msg: "not activated" });
      return makeFetchResponse(200, {});
    });

    const result = await novadaHealth(API_KEY);

    expect(result).toContain("Scraper API (65+ platforms)");
    expect(result).toContain("Not activated");
    expect(result).toContain("dashboard.novada.com/overview/scraper/");
    // Next steps should mention scraper
    expect(result).toContain("## Next Steps");
  });

  it("shows Not configured for Proxy when NOVADA_PROXY_USER env var is absent", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ code: 0 }),
    });
    mockedGetProxyCredentials.mockReturnValue(null);
    mockedGetBrowserWs.mockReturnValue("wss://ws.example.com");

    const result = await novadaHealth(API_KEY);

    expect(result).toContain("Proxy");
    expect(result).toContain("⚠️ Not configured");
    expect(result).toContain("NOVADA_PROXY_USER");
    expect(result).toContain("## Next Steps");
    expect(result).toContain("NOVADA_PROXY_PASS");
    expect(result).toContain("NOVADA_PROXY_ENDPOINT");
  });

  it("shows Not configured for Browser API when NOVADA_BROWSER_WS env var is absent", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ code: 0 }),
    });
    mockedGetProxyCredentials.mockReturnValue({ user: "u", pass: "p", endpoint: "proxy:7777" });
    mockedGetBrowserWs.mockReturnValue(undefined);

    const result = await novadaHealth(API_KEY);

    expect(result).toContain("Browser API");
    expect(result).toContain("⚠️ Not configured");
    expect(result).toContain("NOVADA_BROWSER_WS");
    expect(result).toContain("dashboard.novada.com/overview/browser/");
  });

  it("masks API key — only shows last 4 chars", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    const result = await novadaHealth("supersecretkey-1234");

    expect(result).toContain("****1234");
    expect(result).not.toContain("supersecretkey");
  });

  it("includes ISO timestamp in output", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    const result = await novadaHealth(API_KEY);

    expect(result).toMatch(/checked: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("includes markdown table with correct headers", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    const result = await novadaHealth(API_KEY);

    expect(result).toContain("| Product | Status | Latency |");
    expect(result).toContain("|---------|--------|---------|");
  });

  it("shows summary counts correctly when some products inactive", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/search")) return makeFetchResponse(200, {});
      if (url.includes("/extract")) return makeFetchResponse(403, {});
      if (url.includes("/scrape")) return makeFetchResponse(400, { code: 11006 });
      return makeFetchResponse(200, {});
    });
    mockedGetProxyCredentials.mockReturnValue(null);
    mockedGetBrowserWs.mockReturnValue(undefined);

    const result = await novadaHealth(API_KEY);

    expect(result).toContain("## Summary");
    // 1 active (search), 2 not activated (extract+scraper), 2 not configured (proxy+browser)
    expect(result).toContain("1 active");
    expect(result).toContain("2 not configured");
  });

  it("handles fetch timeout/network error gracefully — shows error row not crash", async () => {
    mockFetch.mockRejectedValue(new Error("fetch failed: connection timeout"));

    const result = await novadaHealth(API_KEY);

    expect(result).toContain("❌ Error:");
    // Should still return a complete markdown table
    expect(result).toContain("## Novada API — Health Check");
    expect(result).toContain("## Summary");
  });

  it("runs all HTTP probes (fetch called 3 times for parallel probes)", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await novadaHealth(API_KEY);

    // Search, Extract, Scraper — 3 HTTP probes
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("does not show Next Steps entry for active products", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    mockedGetProxyCredentials.mockReturnValue({ user: "u", pass: "p", endpoint: "proxy:7777" });
    mockedGetBrowserWs.mockReturnValue("wss://ws.example.com");

    const result = await novadaHealth(API_KEY);

    expect(result).toContain("All products active");
    // Should NOT have bullet action items
    expect(result).not.toContain("- Search API:");
    expect(result).not.toContain("- Proxy:");
  });
});
