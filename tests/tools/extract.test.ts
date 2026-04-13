import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { novadaExtract } from "../../src/tools/extract.js";

vi.mock("axios");
const mockedAxios = vi.mocked(axios);

const API_KEY = "test-key-123";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("novadaExtract", () => {
  const sampleHtml = `
    <html>
      <head>
        <title>Test Page</title>
        <meta name="description" content="A test page for extraction">
      </head>
      <body>
        <main>
          <h1>Main Content</h1>
          <p>This is the main content of the page with enough text to pass the threshold for content extraction. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>
          <a href="https://example.com/link1">Link 1</a>
          <a href="https://example.com/link2">Link 2</a>
        </main>
      </body>
    </html>
  `;

  it("extracts title and content in markdown format", async () => {
    mockedAxios.get.mockResolvedValue({ data: sampleHtml });

    const result = await novadaExtract({ url: "https://example.com", format: "markdown" }, API_KEY);
    expect(result).toContain("title: Test Page");
    expect(result).toContain("A test page for extraction");
    expect(result).toContain("Main Content");
  });

  it("returns raw html when format is html", async () => {
    mockedAxios.get.mockResolvedValue({ data: sampleHtml });

    const result = await novadaExtract({ url: "https://example.com", format: "html" }, API_KEY);
    expect(result).toContain("<html>");
    expect(result).toContain("<title>Test Page</title>");
  });

  it("extracts links from the page", async () => {
    mockedAxios.get.mockResolvedValue({ data: sampleHtml });

    const result = await novadaExtract({ url: "https://example.com", format: "markdown" }, API_KEY);
    expect(result).toContain("https://example.com/link1");
    expect(result).toContain("https://example.com/link2");
  });

  it("throws when response is not HTML", async () => {
    mockedAxios.get.mockResolvedValue({ data: { json: true } });

    await expect(
      novadaExtract({ url: "https://example.com", format: "markdown" }, API_KEY)
    ).rejects.toThrow("Response is not HTML");
  });

  it("returns plain text when format is text", async () => {
    mockedAxios.get.mockResolvedValue({ data: sampleHtml });

    const result = await novadaExtract({ url: "https://example.com", format: "text" }, API_KEY);
    expect(result).toContain("Test Page");
    expect(result).not.toContain("# ");  // no markdown headers
  });
});
