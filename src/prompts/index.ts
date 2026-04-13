// ─── MCP Prompts ─────────────────────────────────────────────────────────────
// Pre-defined workflow templates shown in MCP client UIs.
// These give agents reusable patterns and fix the LobeHub Prompts criterion.

interface PromptArgument {
  name: string;
  description: string;
  required: boolean;
}

interface Prompt {
  name: string;
  description: string;
  arguments: PromptArgument[];
}

interface PromptMessage {
  role: "user" | "assistant";
  content: { type: "text"; text: string };
}

interface ListPromptsResult {
  prompts: Prompt[];
}

interface GetPromptResult {
  description: string;
  messages: PromptMessage[];
}

export const PROMPTS: Prompt[] = [
  {
    name: "research_topic",
    description: "Deep multi-source research on any topic with optional country and focus constraints",
    arguments: [
      { name: "topic", description: "What to research", required: true },
      { name: "country", description: "Country context for geo-relevant results, e.g. 'us', 'de', 'cn'", required: false },
      { name: "focus", description: "Focus area, e.g. 'technical', 'market trends', 'recent news only'", required: false },
    ],
  },
  {
    name: "extract_and_summarize",
    description: "Extract content from one or more URLs and prepare a focused summary",
    arguments: [
      { name: "urls", description: "URL or comma-separated list of URLs to extract", required: true },
      { name: "focus", description: "What aspect to focus on in the extracted content", required: false },
    ],
  },
  {
    name: "site_audit",
    description: "Map a website structure then extract and summarize key sections",
    arguments: [
      { name: "url", description: "Root URL of the site to audit", required: true },
      { name: "sections", description: "Which sections to prioritize, e.g. 'pricing, docs, api'", required: false },
    ],
  },
];

export function listPrompts(): ListPromptsResult {
  return { prompts: PROMPTS };
}

export function getPrompt(name: string, args: Record<string, string>): GetPromptResult {
  switch (name) {
    case "research_topic": {
      const lines = [
        `Please research the following topic thoroughly: "${args.topic}"`,
        args.country ? `Focus on information relevant to: ${args.country}.` : "",
        args.focus ? `Specifically focus on: ${args.focus}.` : "",
        "",
        "Recommended workflow:",
        "1. Use novada_research with depth='auto' for a multi-source overview.",
        "2. Use novada_extract on the 2-3 most relevant source URLs for full content.",
        "3. Synthesize findings into a structured summary with citations.",
      ];
      return {
        description: `Research: ${args.topic}`,
        messages: [{
          role: "user",
          content: { type: "text", text: lines.filter(Boolean).join("\n") },
        }],
      };
    }

    case "extract_and_summarize": {
      const urlList = args.urls.split(",").map(u => u.trim()).filter(Boolean);
      const lines = [
        `Please extract and analyze content from the following URL${urlList.length > 1 ? "s" : ""}:`,
        ...urlList.map(u => `  - ${u}`),
        args.focus ? `\nFocus specifically on: ${args.focus}` : "",
        "",
        "Use novada_extract with the URL(s) above.",
        urlList.length > 1
          ? "Pass them as an array for batch extraction in a single call."
          : "",
        "After extracting, summarize the key information clearly.",
      ];
      return {
        description: `Extract: ${args.urls.slice(0, 60)}${args.urls.length > 60 ? "..." : ""}`,
        messages: [{
          role: "user",
          content: { type: "text", text: lines.filter(Boolean).join("\n") },
        }],
      };
    }

    case "site_audit": {
      const lines = [
        `Please audit the website at: ${args.url}`,
        args.sections ? `Pay special attention to these sections: ${args.sections}` : "",
        "",
        "Recommended workflow:",
        `1. novada_map ${args.url} — discover all pages and understand site structure.`,
        "2. Identify the most important pages (pricing, docs, API reference, about, blog).",
        args.sections
          ? `3. novada_extract the pages matching: ${args.sections}`
          : "3. novada_extract the top 3-5 most important pages.",
        "4. Summarize: site structure, key content, notable features, any gaps.",
      ];
      return {
        description: `Audit: ${args.url}`,
        messages: [{
          role: "user",
          content: { type: "text", text: lines.filter(Boolean).join("\n") },
        }],
      };
    }

    default:
      throw new Error(`Unknown prompt: ${name}. Available: ${PROMPTS.map(p => p.name).join(", ")}`);
  }
}
