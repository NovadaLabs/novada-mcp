import { describe, it, expect } from "vitest";
import { extractMainContent, extractTitle, extractDescription } from "../../src/utils/html.js";

describe("extractMainContent", () => {
  it("extracts content from <main> tag", () => {
    const html = `
      <html><body>
        <nav>Navigation</nav>
        <main>
          <h1>Main Heading</h1>
          <p>This is the main content of the page with enough text to pass the 200-char threshold.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        </main>
        <footer>Footer</footer>
      </body></html>
    `;
    const result = extractMainContent(html);
    expect(result).toContain("Main Heading");
    expect(result).toContain("main content");
    expect(result).not.toContain("Navigation");
    expect(result).not.toContain("Footer");
  });

  it("extracts content from <article> tag when no <main>", () => {
    const html = `
      <html><body>
        <nav>Nav</nav>
        <article>
          <h2>Article Title</h2>
          <p>Article body text that is long enough to exceed the minimum threshold for content extraction.
          We need more than 200 characters here to make the selector match properly in the implementation.</p>
        </article>
      </body></html>
    `;
    const result = extractMainContent(html);
    expect(result).toContain("Article Title");
    expect(result).toContain("Article body text");
  });

  it("falls back to boilerplate removal when no semantic tags", () => {
    const html = `
      <html><body>
        <nav>Nav Links</nav>
        <header>Site Header</header>
        <div>
          <p>Actual page content here.</p>
        </div>
        <footer>Copyright 2024</footer>
      </body></html>
    `;
    const result = extractMainContent(html);
    expect(result).toContain("Actual page content");
    expect(result).not.toContain("Nav Links");
    expect(result).not.toContain("Site Header");
    expect(result).not.toContain("Copyright 2024");
  });

  it("strips <script> and <style> tags", () => {
    const html = `
      <html><body>
        <script>var x = 1;</script>
        <style>.red { color: red; }</style>
        <div><p>Visible content only.</p></div>
      </body></html>
    `;
    const result = extractMainContent(html);
    expect(result).not.toContain("var x");
    expect(result).not.toContain(".red");
    expect(result).toContain("Visible content");
  });

  it("converts headings to markdown format", () => {
    const html = `
      <html><body>
        <div><h1>Title One</h1><h2>Subtitle</h2><p>Paragraph text long enough to be real content body.</p></div>
      </body></html>
    `;
    const result = extractMainContent(html);
    expect(result).toContain("# Title One");
    expect(result).toContain("## Subtitle");
  });

  it("converts list items to markdown", () => {
    const html = `
      <html><body>
        <div><ul><li>First item</li><li>Second item</li></ul></div>
      </body></html>
    `;
    const result = extractMainContent(html);
    expect(result).toContain("- First item");
    expect(result).toContain("- Second item");
  });

  it("decodes HTML entities", () => {
    const html = `
      <html><body>
        <div><p>Tom &amp; Jerry &lt;friends&gt; said &quot;hello&quot;</p></div>
      </body></html>
    `;
    const result = extractMainContent(html);
    expect(result).toContain('Tom & Jerry <friends> said "hello"');
  });

  it("returns empty string for empty HTML", () => {
    expect(extractMainContent("")).toBe("");
  });

  it("truncates output to 30000 characters", () => {
    const longParagraph = "A".repeat(40000);
    const html = `<html><body><div><p>${longParagraph}</p></div></body></html>`;
    const result = extractMainContent(html);
    expect(result.length).toBeLessThanOrEqual(30000);
  });

  it("strips HTML comments", () => {
    const html = `
      <html><body>
        <!-- This is a comment -->
        <div><p>Real content here.</p></div>
      </body></html>
    `;
    const result = extractMainContent(html);
    expect(result).not.toContain("This is a comment");
    expect(result).toContain("Real content");
  });
});

describe("extractTitle", () => {
  it("extracts title from <title> tag", () => {
    const html = `<html><head><title>My Page Title</title></head><body></body></html>`;
    expect(extractTitle(html)).toBe("My Page Title");
  });

  it("trims whitespace from title", () => {
    const html = `<html><head><title>  Spaced Title  </title></head></html>`;
    expect(extractTitle(html)).toBe("Spaced Title");
  });

  it("returns 'Untitled' when no title tag exists", () => {
    const html = `<html><head></head><body>No title</body></html>`;
    expect(extractTitle(html)).toBe("Untitled");
  });

  it("returns 'Untitled' for empty HTML", () => {
    expect(extractTitle("")).toBe("Untitled");
  });
});

describe("extractDescription", () => {
  it("extracts meta description", () => {
    const html = `<html><head><meta name="description" content="A great page about testing."></head></html>`;
    expect(extractDescription(html)).toBe("A great page about testing.");
  });

  it("handles single-quoted meta attributes", () => {
    const html = `<html><head><meta name='description' content='Single quoted desc'></head></html>`;
    expect(extractDescription(html)).toBe("Single quoted desc");
  });

  it("returns empty string when no meta description", () => {
    const html = `<html><head><meta name="keywords" content="test"></head></html>`;
    expect(extractDescription(html)).toBe("");
  });

  it("returns empty string for empty HTML", () => {
    expect(extractDescription("")).toBe("");
  });
});
