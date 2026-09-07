## Advanced walking-log 🧟

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
| `pickEmoji` | Render emoji by level. | - | |

---

> *"We are the walking dead."* — a humble nod to Rick Grimes' famous line, because in a world of over-engineering, sometimes you just need something that keeps it simple and keeps things going.
>
> *"We are the walking dead."* —— 这是对 Rick Grimes 经典台词的谦卑致敬。因为在过度工程化的世界里，有时候你只需要一个能保持简单、持续前行的小工具。

[Want read even more? 还想要阅读更多？](https://github.com/legend80s/todo/logger/README-more-more.md)
