import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { novadaResearch } from "../../src/tools/research.js";

vi.mock("axios");
const mockedAxios = vi.mocked(axios);

const API_KEY = "test-key-123";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("novadaResearch", () => {
  it("produces a research report with multiple queries", async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        data: {
          organic_results: [
            { title: "Source 1", url: "https://source1.com", description: "Info about topic" },
            { title: "Source 2", url: "https://source2.com", description: "More info" },
          ],
        },
      },
    });

    const result = await novadaResearch({ question: "How do AI agents work?", depth: "quick" }, API_KEY);
    expect(result).toContain("## Research Report");
    expect(result).toContain("How do AI agents work?");
    expect(result).toContain("## Search Queries Used");
    expect(result).toContain("## Key Findings");
    expect(result).toContain("## Sources");
    expect(mockedAxios.post.mock.calls.length).toBeGreaterThanOrEqual(3); // quick = 3 queries
  });

  it("reports failed searches in output", async () => {
    let callCount = 0;
    mockedAxios.post.mockImplementation(async () => {
      callCount++;
      if (callCount <= 2) throw new Error("Network error");
      return {
        data: {
          data: {
            organic_results: [
              { title: "Success", url: "https://ok.com", description: "Worked" },
            ],
          },
        },
      };
    });

    const result = await novadaResearch({ question: "Test with failures", depth: "quick" }, API_KEY);
    expect(result).toContain("failed");
  });

  it("deep mode generates more queries", async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        data: {
          organic_results: [
            { title: "Result", url: "https://r.com", description: "Desc" },
          ],
        },
      },
    });

    const result = await novadaResearch({ question: "Complex topic with many aspects", depth: "deep" }, API_KEY);
    expect(result).toContain("deep");
    expect(mockedAxios.post.mock.calls.length).toBeGreaterThanOrEqual(5); // deep = 5-6 queries
  });

  it("deduplicates sources across queries", async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        data: {
          organic_results: [
            { title: "Dedup Test Guide", url: "https://same.com/page", description: "A guide about dedup test query here" },
          ],
        },
      },
    });

    const result = await novadaResearch({ question: "Dedup test query here", depth: "quick" }, API_KEY);
    // Even though 3 queries all return the same URL, it should appear once in findings + once in sources
    const sourceMatches = result.match(/https:\/\/same\.com\/page/g);
    expect(sourceMatches).not.toBeNull();
    expect(sourceMatches!.length).toBeLessThanOrEqual(3);
  });
});

describe("novadaResearch source extraction", () => {
  it("extracts top source URLs and includes content in output", async () => {
    const searchResponse = {
      data: {
        code: 200,
        data: {
          organic_results: [
            { title: "Deep Article", url: "https://example.com/article", description: "Covers the topic" },
          ],
        },
      },
      status: 200, headers: {}, config: {} as never, statusText: "OK",
    };
    const extractResponse = {
      data: "<html><body><h1>Deep Article</h1><p>" + "detailed content ".repeat(30) + "</p></body></html>",
      status: 200, headers: {}, config: {} as never, statusText: "OK",
    };

    // quick depth = 3 search queries (POST), then 1 extraction call (GET via fetchViaProxy)
    mockedAxios.post
      .mockResolvedValueOnce(searchResponse)  // query 1
      .mockResolvedValueOnce(searchResponse)  // query 2
      .mockResolvedValueOnce(searchResponse); // query 3
    mockedAxios.get
      .mockResolvedValueOnce(extractResponse); // extraction: article URL

    const result = await novadaResearch({ question: "What is quantum computing?", depth: "quick" }, "test-key");
    expect(result).toContain("Key Sources");
    expect(result).toContain("extracted:");
  });
});

describe("novadaResearch progress notifications (NOV-319)", () => {
  // Inline fast-path envelope the current search.ts parser expects:
  // resp.data = { code:0, data: { data: { json: [ { rest: { organic: [...] } } ] } } }
  // (parser reads body.data.data.json[0].rest.organic).
  const searchEnvelope = (org: { title: string; url: string; description: string }[]) => ({
    data: { code: 0, data: { data: { json: [{ rest: { organic: org } }] } } },
    status: 200, headers: {}, config: {} as never, statusText: "OK",
  });

  it("emits 4 phase updates (search → collect → extract → synthesize) on the success path", async () => {
    mockedAxios.post.mockResolvedValue(
      searchEnvelope([{ title: "Src", url: "https://src.example.com", description: "About the topic" }])
    );
    mockedAxios.get.mockResolvedValue({
      data: "<html><body><h1>Src</h1><p>" + "body text ".repeat(30) + "</p></body></html>",
      status: 200, headers: {}, config: {} as never, statusText: "OK",
    });

    const updates: { progress: number; total?: number; message?: string }[] = [];
    await novadaResearch(
      { question: "How do AI agents work?", depth: "quick" },
      "test-key",
      (info) => { updates.push(info); }
    );

    expect(updates.map(u => u.progress)).toEqual([1, 2, 3, 4]);
    expect(updates.every(u => u.total === 4)).toBe(true);
    expect(updates[0].message).toMatch(/Searching/i);
    expect(updates[3].message).toMatch(/Synthesiz/i);
  });

  it("is a no-op without a callback and swallows reporter errors", async () => {
    mockedAxios.post.mockResolvedValue(
      searchEnvelope([{ title: "S", url: "https://s.example.com", description: "x" }])
    );
    mockedAxios.get.mockResolvedValue({
      data: "<html><body><p>" + "w ".repeat(40) + "</p></body></html>",
      status: 200, headers: {}, config: {} as never, statusText: "OK",
    });

    // no callback → must not throw
    await expect(
      novadaResearch({ question: "test topic here", depth: "quick" }, "test-key")
    ).resolves.toBeTypeOf("string");

    // throwing callback → must not break research
    await expect(
      novadaResearch(
        { question: "test topic here", depth: "quick" },
        "test-key",
        () => { throw new Error("reporter blew up"); }
      )
    ).resolves.toBeTypeOf("string");
  });
});
