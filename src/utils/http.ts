import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

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
