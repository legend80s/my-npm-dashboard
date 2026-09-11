# Calf 🐘 - Your NPM Dashboard

<h2 align="center">
  <img src="https://raw.githubusercontent.com/legend80s/my-npm-dashboard/refs/heads/main/src/assets/calf-elephant.svg" width="300" />
</h2>

[English](./README.md) | 中文

输入 npm username 查看该用户所有的包，按照第一个版本发布的时间由近及远排序。

```sh
pnpx npm-calf
```

`Calf` 最特殊的含义就是“大象的幼崽”，你的包就像大象的幼崽一样，从出生到长大，需要时间的积累，才能成为真正的“大象”。

## 技术决策

- Native 主义者。
  - 使用原生技术栈，不使用框架、不编译、不打包。
  - 尽量 0 依赖，实在不行则用轻量级依赖。
- 不用 react preact 使用 web components
- 不用 TypeScript 使用原生 JavaScript mjs

### 无需 GitHub 或 npm token

> ⚡ 性能和 & 429

数据来自 github 和 npm 开放 api，服务端采用 [hono](https://hono.dev/) 包装这些 API 提供一对一的缓存 API（Cache-Control: max-age=3600），以便利用浏览器缓存防止 429。

因此你可以无需填任何 token 而且二次启动速度极快！
