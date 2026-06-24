import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";

export interface OutputOptions {
  tool: string;        // "scrape", "extract", "search", "research"
  hint?: string;       // domain name or query keyword (sanitized)
  format: "json" | "csv" | "md";
  data: unknown;       // the actual content to save
  cosUrl?: string;     // COS download URL (scraper API only)
}

export interface OutputResult {
  filePath: string;    // absolute path to saved file
  cosUrl?: string;     // COS download URL if available
  recordCount?: number;
  summary: string;     // human-readable summary line
}

/**
 * Sanitize a string for safe use as a filename component.
 * Removes special chars, truncates to 40 chars.
 */
function sanitizeHint(hint: string): string {
  return hint
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40)
    || "output";
}

/**
 * Get the output directory for today, creating it if needed.
 * Returns: ~/Downloads/novada-mcp/YYYY-MM-DD/
 */
async function getOutputDir(): Promise<string> {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const dir = join(homedir(), "Downloads", "novada-mcp", today);
  await mkdir(dir, { recursive: true }); // idempotent, no need for existsSync guard
  return dir;
}

/**
 * Generate a unique filename.
 * Format: {tool}_{hint}_{HHmmss}.{format}
 */
function generateFileName(tool: string, hint: string, format: string): string {
  const now = new Date();
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "") + String(now.getMilliseconds()).padStart(3, "0"); // HHmmssSSS
  const safeHint = sanitizeHint(hint);
  return `${tool}_${safeHint}_${time}.${format}`;
}

/**
 * Convert an array of records to CSV string.
 */
export function toCsv(records: Record<string, unknown>[]): string {
  if (records.length === 0) return "";

  // Collect all unique keys across all records
  const allKeys = new Set<string>();
  for (const rec of records) {
    for (const key of Object.keys(rec)) {
      allKeys.add(key);
    }
  }
  const headers = [...allKeys];

  // Escape CSV field: wrap in quotes if contains comma, quote, or newline
  const escapeField = (val: unknown): string => {
    const str = val === null || val === undefined ? "" : String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const headerLine = headers.map(escapeField).join(",");
  const dataLines = records.map(rec =>
    headers.map(h => escapeField(rec[h])).join(",")
  );

  return [headerLine, ...dataLines].join("\n");
}

/**
 * Save output to file. Returns metadata about the saved file.
 */
export async function saveOutput(options: OutputOptions): Promise<OutputResult> {
  const { tool, hint = "output", format, data, cosUrl } = options;

  const dir = await getOutputDir();
  const fileName = generateFileName(tool, hint, format);
  const filePath = join(dir, fileName);

  let content: string;
  let recordCount: number | undefined;

  switch (format) {
    case "json": {
      content = JSON.stringify(data, null, 2);
      if (Array.isArray(data)) recordCount = data.length;
      break;
    }
    case "csv": {
      const records = Array.isArray(data)
        ? data.map(item => typeof item === "object" && item !== null ? item as Record<string, unknown> : { value: item })
        : [typeof data === "object" && data !== null ? data as Record<string, unknown> : { value: data }];
      content = toCsv(records);
      recordCount = records.length;
      break;
    }
    case "md": {
      content = typeof data === "string" ? data : JSON.stringify(data, null, 2);
      break;
    }
    default:
      content = String(data);
  }

  await writeFile(filePath, content, "utf-8");

  const sizeKB = Math.round(Buffer.byteLength(content) / 1024);
  const parts = [`Saved to: ${filePath} (${sizeKB}KB)`];
  if (recordCount !== undefined) parts.push(`${recordCount} records`);
  if (cosUrl) parts.push(`Download: ${cosUrl}`);

  return {
    filePath,
    cosUrl,
    recordCount,
    summary: parts.join(" | "),
  };
}
