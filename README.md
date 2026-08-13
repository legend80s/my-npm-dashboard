# Calf + 🐘 - My NPM Dashboard

<h2 align="center">
  <img src="./assets/calf-elephant.svg" width="300" />
</h2>

输入 npm username 能够查看这个用户所有的包，按照第一个版本发布的时间由近及远排序

因为 `Calf` 最特殊的含义就是“大象的幼崽”，

```
🐘 npm-calf
```

> **Calf** — because even the biggest elephants start small, but we track them all.

> My NPM <img src="./src/closed-npm.svg" width="16" align="end" style="vertical-align: middle;" alt="D" title="npm dashboard logo" />ashboard built with Tauri and Vanilla JS

This template should help get you started developing with Tauri in vanilla HTML, CSS and Javascript.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 技术决策

- Native 主义者。使用原生技术栈，不使用框架、不编译、不打包。0 依赖。
- 不用 react 甚至 preact 使用 web components
- 不用 TypeScript 使用原生 JavaScript mjs