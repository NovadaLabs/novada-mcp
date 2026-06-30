---
name: Bug report
about: Report a problem with novada-mcp
title: "[Bug] "
labels: bug
assignees: ''
---

## Describe the bug

A clear and concise description of what the bug is.

## Tool / area involved

Which MCP tool or part of the server is affected (e.g. `novada_extract`,
`novada_scrape`, proxy helpers, build/setup)?

## To reproduce

Steps to reproduce the behavior. Include the exact tool call and arguments where
possible:

```jsonc
// e.g.
{ "tool": "novada_extract", "args": { "url": "https://example.com", "format": "markdown" } }
```

## Expected behavior

What you expected to happen.

## Actual behavior

What actually happened. Paste any error message or tool output.

> **Do not paste secrets.** Redact your `NOVADA_API_KEY`, proxy credentials, and any
> `user:pass@host` strings before submitting.

## Environment

- novada-mcp version:
- Node.js version (`node -v`):
- OS:
- MCP client (Claude Code / Claude Desktop / Cursor / hosted endpoint / other):

## Additional context

Anything else that might help — logs (with `NOVADA_LOG=debug`, secrets redacted),
screenshots, or related issues.
