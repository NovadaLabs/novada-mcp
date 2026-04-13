#!/usr/bin/env node

/**
 * nova CLI — Direct command-line access to Novada web data tools.
 *
 * Usage:
 *   nova search "best AI frameworks 2025"
 *   nova extract https://example.com
 *   nova crawl https://docs.example.com --pages 10
 *   nova map https://example.com --search "api"
 *   nova research "How do AI agents use web scraping?"
 */

import { novadaSearch, novadaExtract, novadaCrawl, novadaResearch, novadaMap } from "./tools/index.js";
import { validateSearchParams, validateExtractParams, validateCrawlParams, validateResearchParams, validateMapParams } from "./tools/index.js";
import { VERSION } from "./config.js";

const API_KEY = process.env.NOVADA_API_KEY;

const HELP = `nova v${VERSION} — Novada web data CLI

Usage:
  nova search <query> [--engine google] [--num 10] [--country us] [--time day|week|month|year]
              [--include domain1,domain2] [--exclude domain1,domain2]
  nova extract <url> [--format markdown|text|html]
  nova crawl <url> [--max-pages 5] [--strategy bfs|dfs]
              [--select "/docs/.*,/api/.*"] [--exclude-paths "/blog/.*"]
              [--instructions "only API reference pages"]
  nova map <url> [--search <term>] [--limit 50] [--max-depth 2]
  nova research <question> [--depth auto|quick|deep|comprehensive] [--focus "technical"]

Environment:
  NOVADA_API_KEY  Your API key (required). Get one at https://www.novada.com

Examples:
  nova search "GPT-5 release" --time week --country us
  nova search "best AI tools" --include "github.com,arxiv.org"
  nova extract https://example.com --format markdown
  nova crawl https://docs.example.com --max-pages 10 --select "/api/.*"
  nova crawl https://docs.example.com --instructions "only quickstart pages"
  nova map https://example.com --search "pricing" --max-depth 3
  nova research "How do AI agents use web scraping?" --depth deep --focus "production use cases"
`;

function parseArgs(args: string[]): { positional: string; flags: Record<string, string> } {
  let positional = "";
  const flags: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--") && i + 1 < args.length) {
      flags[args[i].slice(2)] = args[i + 1];
      i++;
    } else if (!positional) {
      positional = args[i];
    }
  }
  return { positional, flags };
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);

  if (!command || command === "--help" || command === "-h") {
    console.log(HELP);
    process.exit(0);
  }

  if (command === "--version" || command === "-v") {
    console.log(`nova v${VERSION}`);
    process.exit(0);
  }

  if (!API_KEY) {
    console.error("Error: NOVADA_API_KEY not set. Get your key at https://www.novada.com");
    process.exit(1);
  }

  const { positional, flags } = parseArgs(rest);

  if (!positional) {
    console.error(`Error: ${command} requires an argument. Run 'nova --help' for usage.`);
    process.exit(1);
  }

  try {
    let result: string;

    switch (command) {
      case "search":
        result = await novadaSearch(
          validateSearchParams({
            query: positional,
            engine: flags.engine || "google",
            num: flags.num ? parseInt(flags.num) : 10,
            country: flags.country || "",
            language: flags.language || "",
            time_range: flags.time as "day" | "week" | "month" | "year" | undefined,
            start_date: flags.from,
            end_date: flags.to,
            include_domains: flags.include ? flags.include.split(",").map((d: string) => d.trim()) : undefined,
            exclude_domains: flags.exclude ? flags.exclude.split(",").map((d: string) => d.trim()) : undefined,
          }),
          API_KEY
        );
        break;

      case "extract":
        result = await novadaExtract(
          validateExtractParams({
            url: positional,
            format: (flags.format as "markdown" | "text" | "html") || "markdown",
          }),
          API_KEY
        );
        break;

      case "crawl":
        result = await novadaCrawl(
          validateCrawlParams({
            url: positional,
            max_pages: flags["max-pages"]
              ? parseInt(flags["max-pages"])
              : flags.pages
                ? parseInt(flags.pages)
                : 5,
            strategy: (flags.strategy as "bfs" | "dfs") || "bfs",
            instructions: flags.instructions,
            select_paths: flags.select ? flags.select.split(",").map((p: string) => p.trim()) : undefined,
            exclude_paths: flags["exclude-paths"] ? flags["exclude-paths"].split(",").map((p: string) => p.trim()) : undefined,
          }),
          API_KEY
        );
        break;

      case "map":
        result = await novadaMap(
          validateMapParams({
            url: positional,
            search: flags.search,
            limit: flags.limit ? parseInt(flags.limit) : 50,
            max_depth: flags["max-depth"] ? parseInt(flags["max-depth"]) : 2,
          }),
          API_KEY
        );
        break;

      case "research":
        result = await novadaResearch(
          validateResearchParams({
            question: positional,
            depth: (flags.depth as "quick" | "deep" | "auto" | "comprehensive") || "auto",
            focus: flags.focus,
          }),
          API_KEY
        );
        break;

      default:
        console.error(`Unknown command: ${command}. Run 'nova --help' for usage.`);
        process.exit(1);
    }

    console.log(result);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
