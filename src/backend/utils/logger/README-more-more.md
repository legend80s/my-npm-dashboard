# walking-log

> *"We are the walking dead."* — a humble nod to Rick Grimes' famous line, because in a world of over-engineering, sometimes you just need something that keeps it simple and keeps things going.
>
> *"We are the walking dead."* —— 这是对 Rick Grimes 经典台词的谦卑致敬。因为在过度工程化的世界里，有时候你只需要一个能保持简单、持续前行的小工具。

**walking-log** is a minimal console logger for **Node.js only**.

Like a walker in the terminal wasteland, it does one thing and does it well — **print to the console**. No browser, no DOM, no distractions. Just pure, simple logging for your Node.js applications.

就像终端废土上的一个行者，它只做一件事，并把它做好——打印到控制台。不涉及浏览器，不涉及 DOM，没有多余干扰。就是为你的 Node.js 应用提供纯粹、简单的日志打印。

## Why walking-log?

- 🧟 **Node.js only** — It doesn't wander into browser territory.
- 🎯 **Single purpose** — Print to console. That's it. No plugins, no bloat.
- ⚡ **Lightweight** — Zero dependencies. Just your terminal and a log.

When the world is full of complex logging frameworks, be a walker. Keep it simple. Keep it moving.

- 🧟 仅限 Node.js —— 不会游荡到浏览器领域。
- 🎯 单一职责 —— 打印到控制台。就这些。没有插件，没有冗余。
- ⚡ 轻量级 —— 零依赖。只需你的终端和一行日志。

当这个世界充斥着复杂的日志框架时，做一个行者。保持简单。保持前进。

## Where should I use walking-log?

- **CLI tools** — ✅ For logging in your command-line tools.
- **Scripts** — ✅ For logging in your one-off scripts.
- Node.js applications — ❌ NOT suitable.
- Web applications — ❌ NOT "survive" in browser environments.

When you need a simple, lightweight logging solution for your Node.js CLI projects, walking-log is the way to go.

## Quick Start

```bash
npm install walking-log
```

```javascript
import { createLogger } from 'walking-log'

const logger = createLogger({ verbose: true })

logger.info('Hello from the wasteland.')
logger.warn('Watch out for walkers.')
logger.error('We lost another one.')
```

Need a more tailored one?

```javascript
import { Logger, LEVEL } from 'walking-log'

const logger = new Logger({
  level: LEVEL.DEBUG,
  diffToHumanTime: (diff) => {
    if (diff < 1000) {
      return `${diff}ms`
    }
    return `${Math.floor(diff / 1000)}.${String(diff % 1000).padStart(3, "0")}s`
  },
})

logger.debug("The Walking Log Episode 3.0.0")
logger.debug("The Walking Log Episode", "3.0.0")
logger.debug("The Walking Log Episode", "v", 3)

logger.info("The Walking Log Episode", {
  string: "3.0.0",
  boolean: true,
  number: 123,
  array: [1, 2, 3],
  object: { a: 1, b: 2 },
})

logger.warn("A new version of walking-log is available: 3.0.1")

logger.success("Project built!")

logger.error(new Error("This is an example error. Everything is fine!"))
```

## Config

| Field | Description | Default | Required |
| --- | --- | --- | --- |
| `level` | log level `debug < info < warn < error < none` *none to disable all logs* | - | `true` |
| `color` | Should decorate with colors? | `false` | |
| `emoji` | Should decorate with emojis? | `false` | |
| `showDiff` | Show elapsed time since the previous message. | `false` | |
| `showTime` | Should show timestamp? | `true` | |
| `formatTime` | How to print timestamp. | `(date: Date) => date.toISOString()` | |
| `diffToHumanTime` | Time diff to human readable string. | (timeDiff: number) => `${timeDiff.toLocaleString("en")}ms` | |
| `formatLevel` | How to print level. | `(level) => '[' + level + ']'` | |
| `pickEmoji` | Render emoji by level. |  | |

---

*"In a world of frameworks, just be a log."*  
*"在一个充满框架的世界里，只做一个日志器。"*

## The Story Behind the Name / 命名由来

### English

The name **walking-log** is inspired by the iconic TV series *The Walking Dead* — but with a developer's twist.

In the show, "walkers" are relentless, single-minded creatures. They don't stop. They don't overthink. They just **walk** — slowly, steadily, endlessly.

That's exactly what this package does.

In a JavaScript ecosystem crowded with heavy logging frameworks — Winston, Pino, Bunyan — each with their own transports, plugins, and configuration nightmares, **walking-log** takes a step back. It doesn't try to send logs to files, databases, or remote servers. It doesn't parse source maps or format JSON in 17 different ways.

It just **prints to the console**. One step at a time. One line at a time.

Like a walker, it has one purpose: move forward. In our case, that means printing whatever you tell it to print — right there in your Node.js terminal.

> *"We are the walking log."* — a humble nod to Rick Grimes' famous line, because in a world of over-engineering, sometimes you just need something that keeps it simple and keeps going.

---

### 中文

**walking-log** 这个名字的灵感来源于经典剧集《行尸走肉》（*The Walking Dead*），但赋予了一层开发者视角的解读。

在剧中，“行者”（Walker）是一种不知疲倦、目标单一的生物。它们不会停下，不会想太多，只是**行走**——缓慢地、稳定地、永无止境地。

这正是这个包所做的。

在 JavaScript 生态系统中，充斥着各种重量级的日志框架——Winston、Pino、Bunyan——它们各有各的传输方式、插件体系、配置噩梦。而 **walking-log** 选择退一步。它不试图把日志发送到文件、数据库或远程服务器，不解析 source map，也不以 17 种不同方式格式化 JSON。

它只是**打印到控制台**。一步一个脚印，一行一行输出。

就像行者一样，它只有一个目标：往前走。在它的语境里，就是把你告诉它打印的东西，原原本本地打印在你的 Node.js 终端里。

> *"We are the walking log."* —— 这是对 Rick Grimes 经典台词的谦卑致敬。因为在过度工程化的世界里，有时候你只需要一个能保持简单、持续前行的小工具。

---

## Why "log" not "logger"? / 为什么是 "log" 而不是 "logger"？

---

### English

Because it's not trying to be a full-fledged **logger** with all the bells and whistles. It's just a **log** — a single, honest print statement. Simple, humble, and enough.

### 中文

因为它不试图成为一个功能齐全的 **logger**（日志器），带那么多花哨功能。它就是一个 **log**（日志）—— 一次简单、诚实的打印输出。简单、谦逊，且足够用。

---

这段文字想传达的是一种极简主义的哲学态度，和《行尸走肉》中行者那种"简单、持续、不复杂"的精神内核相呼应。需要我调整措辞或增减内容吗？😄