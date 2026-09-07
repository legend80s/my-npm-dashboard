# 🧟 walking-log

<div align="center">
  <img src="https://koboyo.com/icons/svg/cartoon-zombie.svg" width="300" alt="cartoon zombie from https://koboyo.com/icons?q=zombie" />
</div>


> **walking-log** is a colorful yet minimal console log for **Node.js only**.

> <img src="https://github.com/legend80s/my-npm-dashboard/raw/refs/heads/main/src/backend/utils/logger/assets/languages.svg" width="16" height="16" alt="Chinese:" /> 就是一个 Node.js 控制台彩色 console.log 而已，不涉及浏览器，仅为 Node.js CLI 提供纯粹、简单的信息输出。

## Features

Zero dependencies, just one file with 120 LOC. Copy or install however you like.

<img src="https://github.com/legend80s/my-npm-dashboard/raw/refs/heads/main/src/backend/utils/logger/assets/languages.svg" width="16" height="16" alt="Chinese:" /> 零依赖，仅 120 行代码的单文件。复制或安装随意。

## Quick Start

```bash
npm install walking-log
```

```javascript
import { createLogger } from 'walking-log'

const logger = createLogger({ verbose: true })

logger.debug('walking-log is a colorful yet minimal console log for Node.js only.')
logger.info('We are the walking dead. / 我们就是行尸走肉。')
logger.warn('Watch out for walkers.')
logger.success('Walkers clear.')
logger.error('We lost another teammate!')
```

[Want a more tailored one? 想要阅读更多？](./README-more.md)
