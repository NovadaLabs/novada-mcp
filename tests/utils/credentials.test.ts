import { describe, it, expect, beforeEach } from "vitest";
import { withCredentials, getWebUnblockerKey, getBrowserWs, getProxyCredentials } from "../../src/utils/credentials.js";

describe("credentials — env var fallback", () => {
  beforeEach(() => {
    delete process.env.NOVADA_WEB_UNBLOCKER_KEY;
    delete process.env.NOVADA_BROWSER_WS;
    delete process.env.NOVADA_PROXY_USER;
    delete process.env.NOVADA_PROXY_PASS;
    delete process.env.NOVADA_PROXY_ENDPOINT;
  });

  it("getWebUnblockerKey returns undefined when not set", () => {
    expect(getWebUnblockerKey()).toBeUndefined();
  });

  it("getWebUnblockerKey reads from process.env fallback", () => {
    process.env.NOVADA_WEB_UNBLOCKER_KEY = "env-key";
    expect(getWebUnblockerKey()).toBe("env-key");
  });

  it("getBrowserWs returns undefined when not set", () => {
    expect(getBrowserWs()).toBeUndefined();
  });

  it("getBrowserWs reads from process.env fallback", () => {
    process.env.NOVADA_BROWSER_WS = "wss://example.com";
    expect(getBrowserWs()).toBe("wss://example.com");
  });

  it("getProxyCredentials returns null when env vars missing", () => {
    expect(getProxyCredentials()).toBeNull();
  });

  it("getProxyCredentials returns null when only some vars set", () => {
    process.env.NOVADA_PROXY_USER = "user";
    process.env.NOVADA_PROXY_PASS = "pass";
    // no endpoint
    expect(getProxyCredentials()).toBeNull();
  });

  it("getProxyCredentials returns creds when all env vars set", () => {
    process.env.NOVADA_PROXY_USER = "user";
    process.env.NOVADA_PROXY_PASS = "pass";
    process.env.NOVADA_PROXY_ENDPOINT = "proxy.example.com:7777";
    const creds = getProxyCredentials();
    expect(creds).toEqual({ user: "user", pass: "pass", endpoint: "proxy.example.com:7777" });
  });
});

describe("withCredentials — scoped overrides", () => {
  beforeEach(() => {
    delete process.env.NOVADA_WEB_UNBLOCKER_KEY;
    delete process.env.NOVADA_BROWSER_WS;
    delete process.env.NOVADA_PROXY_USER;
  });

  it("scoped key overrides env var for the duration of fn", async () => {
    process.env.NOVADA_WEB_UNBLOCKER_KEY = "env-key";
    let insideKey: string | undefined;

    await withCredentials({ webUnblockerKey: "scoped-key" }, async () => {
      insideKey = getWebUnblockerKey();
    });

    expect(insideKey).toBe("scoped-key");
    // After exiting scope, env var is back
    expect(getWebUnblockerKey()).toBe("env-key");
  });

  it("multiple concurrent scopes are isolated", async () => {
    const results: string[] = [];

    await Promise.all([
      withCredentials({ webUnblockerKey: "key-A" }, async () => {
        await new Promise(r => setTimeout(r, 10));
        results.push(getWebUnblockerKey() ?? "none");
      }),
      withCredentials({ webUnblockerKey: "key-B" }, async () => {
        await new Promise(r => setTimeout(r, 5));
        results.push(getWebUnblockerKey() ?? "none");
      }),
    ]);

    // Both keys must appear, no cross-contamination
    expect(results).toContain("key-A");
    expect(results).toContain("key-B");
  });

  it("scoped proxy creds override env vars", async () => {
    process.env.NOVADA_PROXY_USER = "env-user";
    process.env.NOVADA_PROXY_PASS = "env-pass";
    process.env.NOVADA_PROXY_ENDPOINT = "env.proxy.com:7777";

    let insideCreds: { user: string; pass: string; endpoint: string } | null = null;
    await withCredentials({ proxyUser: "sdk-user", proxyPass: "sdk-pass", proxyEndpoint: "sdk.proxy.com:7777" }, async () => {
      insideCreds = getProxyCredentials();
    });

    expect(insideCreds).toEqual({ user: "sdk-user", pass: "sdk-pass", endpoint: "sdk.proxy.com:7777" });
    // Env vars still intact after scope
    expect(getProxyCredentials()).toEqual({ user: "env-user", pass: "env-pass", endpoint: "env.proxy.com:7777" });
  });

  it("withCredentials returns the fn return value", async () => {
    const result = await withCredentials({ webUnblockerKey: "k" }, async () => 42);
    expect(result).toBe(42);
  });
});
