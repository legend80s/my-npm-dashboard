## Fully-loaded version of walking-log 🧟

Need a more tailored one?

```javascript
import { Logger, LEVEL } from 'walking-log'

const logger = new Logger({
  level: LEVEL.INFO,
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

[Want read even more? 还想要阅读更多？](./README-more-more.md)
