import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { UNBLOCKER_API_BASE } from "../config.js";

export const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000;

/** HTTP GET with exponential backoff retry on 429/503/network errors */
export async function fetchWithRetry(
  url: string,
  options: Partial<AxiosRequestConfig> = {},
  retries: number = MAX_RETRIES
): Promise<AxiosResponse> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await axios.get(url, {
        headers: { "User-Agent": USER_AGENT },
        timeout: 30000,
        maxRedirects: 5,
        ...options,
      });
    } catch (error) {
      if (attempt === retries) throw error;
      const isRetryable =
        error instanceof AxiosError &&
        (error.response?.status === 429 ||
          error.response?.status === 503 ||
          !error.response);
      if (!isRetryable) throw error;
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error(`Failed after ${retries + 1} attempts: ${url}`);
}

/**
 * Fetch a URL through Novada's Web Unblocker proxy.
 * Fallback chain:
 *   1. Web Unblocker (AI CAPTCHA bypass, residential IPs) — requires NOVADA_UNBLOCKER_KEY
 *   2. Direct fetch (no proxy)
 *
 * Note: _apiKey param is kept for API compatibility but unused — scraperapi.novada.com
 * root endpoint (for URL fetching) is deprecated. Search uses scraperapi directly.
 */
export async function fetchViaProxy(
  url: string,
  _apiKey: string | undefined,
  options: Partial<AxiosRequestConfig> = {}
): Promise<AxiosResponse> {
  const unblockerKey = process.env.NOVADA_UNBLOCKER_KEY;

  if (unblockerKey) {
    try {
      const response = await axios.post(
        UNBLOCKER_API_BASE,
        { target_url: url, response_format: "html" },
        {
          headers: {
            Authorization: `Bearer ${unblockerKey}`,
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );

      // Web Unblocker response: { code: 0, data: { html: "...", code: 200, ... } }
      const html: unknown = response.data?.data?.html;
      if (typeof html === "string" && html.length >= 300) {
        return { ...response, data: html } as AxiosResponse;
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        // Re-throw auth and rate-limit errors — don't mask with direct fetch fallback
        if (status === 401 || status === 403 || status === 429) {
          throw error;
        }
      }
      // Fall through to direct fetch for other errors (network, 5xx, etc.)
    }
  }

  // — Fallback: direct fetch (no proxy) —
  return fetchWithRetry(url, options);
}
