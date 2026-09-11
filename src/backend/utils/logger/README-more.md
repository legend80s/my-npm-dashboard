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


logger.warn("A new version of walking-log is available: 0.0.5")
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
| `decorations` | Customize color and emoji. See [customize](./index.test.js#L33) | [default `decorations`](./index.js#L43) | |

[🧟 Want read even more? 还想要阅读更多？](./README-more-more.md)
