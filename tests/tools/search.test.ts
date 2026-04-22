import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { novadaSearch } from "../../src/tools/search.js";

vi.mock("axios");
const mockedAxios = vi.mocked(axios);

const API_KEY = "test-key-123";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("novadaSearch", () => {
  it("returns formatted results on success", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        code: 200,
        data: {
          organic_results: [
            { title: "Result 1", url: "https://example.com/1", description: "Desc 1" },
            { title: "Result 2", url: "https://example.com/2", description: "Desc 2" },
          ],
        },
      },
    });

    const result = await novadaSearch({ query: "test query", engine: "google", num: 10, country: "", language: "" }, API_KEY);
    expect(result).toContain("Result 1");
    expect(result).toContain("https://example.com/1");
    expect(result).toContain("Result 2");
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it("returns 'no results' when organic_results is empty", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { code: 200, data: { organic_results: [] } },
    });

    const result = await novadaSearch({ query: "obscure query", engine: "google", num: 10, country: "", language: "" }, API_KEY);
    expect(result).toBe("No results found for this query.");
  });

  it("returns no results when API returns non-200 code", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { code: 402, msg: "Insufficient credits" },
    });

    const result = await novadaSearch({ query: "test", engine: "google", num: 10, country: "", language: "" }, API_KEY);
    expect(result).toContain("No results found");
  });

  it("handles flat organic_results (no data wrapper)", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        organic_results: [
          { title: "Flat Result", link: "https://flat.com", snippet: "A snippet" },
        ],
      },
    });

    const result = await novadaSearch({ query: "test", engine: "google", num: 10, country: "", language: "" }, API_KEY);
    expect(result).toContain("Flat Result");
    expect(result).toContain("https://flat.com");
    expect(result).toContain("A snippet");
  });

  it("passes country/language params to API", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { data: { organic_results: [{ title: "T", url: "https://t.com", description: "D" }] } },
    });

    await novadaSearch({ query: "test", engine: "google", num: 5, country: "de", language: "de" }, API_KEY);
    const calledUrl = mockedAxios.get.mock.calls[0][0] as string;
    expect(calledUrl).toContain("country=de");
    expect(calledUrl).toContain("language=de");
  });
});
