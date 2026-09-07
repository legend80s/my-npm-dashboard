# 🧟 walking-log

> **walking-log** is a colorful yet minimal console log for **Node.js only**.

> 就是一个 Node.js 控制台彩色 console.log 而已，不涉及浏览器，仅为 Node.js CLI 提供纯粹、简单的信息输出。

## Quick Start

```bash
npm install walking-log
```

```javascript
import { createLogger } from 'walking-log'

const logger = createLogger({ verbose: true })

logger.debug('walking-log is a colorful yet minimal console log for Node.js only.')
logger.info('Hello from the wasteland.')
logger.warn('Watch out for walkers.')
logger.success('Walkers clear.')
logger.error('We lost another teammate!')
```

[Want to read more? 想要阅读更多？](https://github.com/legend80s/my-npm-dashboard/src/backend/utils/logger/README-more.md)
