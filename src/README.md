# Calf 🐘 - Your NPM Dashboard

<h2 align="center">
  <img src="./assets/calf-elephant.svg" width="300" />
</h2>

输入 npm username 能够查看这个用户所有的包，按照第一个版本发布的时间由近及远排序

因为 `Calf` 最特殊的含义就是“大象的幼崽”，

```sh
pnpx npm-calf
```

> **Calf** — because even the biggest elephants start small, but we track them all.

Every big project starts as a calf. Tend your whole npm herd, sorted by birth date.

A npm dashboard for your recently "born" packages

## 技术决策

- Native 主义者。
  - 使用原生技术栈，不使用框架、不编译、不打包。
  - 尽量 0 依赖，实在不行则用轻量级依赖。
- 不用 react 甚至 preact 使用 web components
- 不用 TypeScript 使用原生 JavaScript mjs

All data is from github and npm api and with browser caching for 429.
