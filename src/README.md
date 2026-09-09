# NPM-Calf 🐘 - Your NPM Dashboard

<h2 align="center">
  <img src="https://raw.githubusercontent.com/legend80s/pocket/refs/heads/main/src/assets/calf-elephant.svg" width="300" />
</h2>

[中文](./README.zh.md) | English

> **Calf** — because even the biggest elephants start small, but we track them all.

Every big project starts as a calf. Tend your whole npm herd, sorted by birth date.

A npm dashboard for your recently "born" packages

```sh
pnpx npm-calf
```

## Technical Choices

A npm dashboard and also a "dashboard" for all the modern web technologies.

- Web Components
- async import(CDN)
- JavaScript but with ES Modules and strict TypeScript types
- Use native technologies, no bundling, no frameworks, no compilation.

### Zero config — No need for github or npm token

> ⚡ Performance & 429

All data is from github and npm API and with browser caching to avoid 429 using [hono](https://hono.dev/) (Cache-Control: max-age=3600
).

Therefore no token required, and the secondary startup is blazing fast ⚡.
