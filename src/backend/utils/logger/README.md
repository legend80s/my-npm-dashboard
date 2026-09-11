<h1 align="center">walking-log</h1>

<p>
  <div align="center" style="margin-bottom: 1rem;">
    <a href="https://www.npmjs.com/package/walking-log" style="display: flex; align-items: endx; justify-content: center;">
      <img src="https://koboyo.com/icons/svg/zombie.svg" width="200" alt="cartoon zombie from https://koboyo.com/icons?q=zombie" />
  
  <img src="https://koboyo.com/icons/svg/cartoon-terminal-error-line.svg" alt="cartoon terminal error line from https://koboyo.com/icons?q=terminal" width="100" />
    </a>
  </div>
</p>

> A 🎈 light-weight substitution of [![consola](https://img.shields.io/badge/consola-gray?logo=github)](https://github.com/unjs/consola). consola is great but it's too heavy for my needs.
>
> **walking-log** is a colorful yet minimal console log for **Node.js only**.

> <img src="https://github.com/legend80s/my-npm-dashboard/raw/refs/heads/main/src/backend/utils/logger/assets/languages.svg" width="16" height="16" alt="Chinese:" /> 就是一个 Node.js 控制台彩色 console.log 而已，不涉及浏览器，仅为 Node.js CLI 提供纯粹、简单的信息输出。

## Features

[![walking-log](https://img.shields.io/badge/walking--log-black?logo=github)](https://github.com/legend80s/my-npm-dashboard/blob/main/src/backend/utils/logger) **0** dependencies, just one file with 120 LOC 🤏. It's a drop-in replacement for [![consola](https://img.shields.io/badge/consola-x?logo=npm&colorA=red&colorB=wheat)](https://www.npmjs.com/package/consola).

Copy or install however you like.

<img src="https://github.com/legend80s/my-npm-dashboard/raw/refs/heads/main/src/backend/utils/logger/assets/languages.svg" width="16" height="16" alt="Chinese:" /> [![walking-log](https://img.shields.io/badge/walking--log-black?logo=github)](https://github.com/legend80s/my-npm-dashboard/blob/main/src/backend/utils/logger) **零**依赖，仅 120 行代码的单文件。可当做 [![consola](https://img.shields.io/badge/consola-x?logo=npm&colorA=red&colorB=wheat)](https://www.npmjs.com/package/consola) 的轻量级替代品。复制或安装随意。

## Quick Start

```bash
npm install walking-log
```

```javascript
import { createLogger } from 'walking-log'

const logger = createLogger({ verbose: true })

logger.debug("I'm not the good guy anymore.")
logger.info("We are the walking dead.")
logger.warn("If you don't fight, you die.")
logger.success("We survive this by pulling together, not apart.")
logger.error("I didn't ask for this. I killed my best friend for you people.")
```

[🧟 Want a more tailored one? 想要阅读更多？](./README-more.md)
