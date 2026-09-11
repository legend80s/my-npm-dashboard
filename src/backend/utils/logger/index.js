// import { consola } from "consola";
/** @typedef {number} int */

import { styleText } from "node:util"

export const BASH_COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  gray: "\x1b[90m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  brightBlue: "\x1b[94m",
  // '亮青色'
  cyanBright: "\x1b[96m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

// styleText('cyanBright')

/**
 * `trace (最低) < debug < info < warn < error < fatal (最高)`
 *
 * 当你设置一个日志级别（例如 info），只有优先级 ≥ info 的日志（即 info、warn、error、fatal）会被输出；而 trace 和 debug 级别的日志会被忽略。这正是日志级别配置的核心作用。
 * none: 用于关闭所有日志输出（静默模式）。
 */
export const LEVEL = /** @type {const} */ ({
  DEBUG: 1,
  INFO: 2,
  get SUCCESS() {
    return LEVEL.INFO
  },
  WARN: 3,
  ERROR: 4,
  NONE: 5,
})

/**
 * @satisfies { { [key in LevelKey | 'success']: { emoji: string, color: string } } }
 */
const decorations = {
  debug: { emoji: "🐞", color: BASH_COLORS.cyanBright },
  info: { emoji: styleText("blueBright", "ℹ"), color: "" },
  warn: { emoji: "🟡", color: BASH_COLORS.yellow },
  error: { emoji: "🔴", color: BASH_COLORS.red },
  success: { emoji: styleText("green", "✔"), color: BASH_COLORS.green },
}

/** @typedef { typeof decorations } Decorations */
/** @typedef { typeof LEVEL[keyof typeof LEVEL] } LevelNumber */
/** @typedef { Exclude<Lowercase<keyof typeof LEVEL>, 'none'> } LevelKey */
/** @import { LoggerOptions } from './logger.type.js' */

export class Logger {
  /** @type {int | null} */
  #now = null
  /**
   *
   * @param {LoggerOptions} opts
   */
  constructor(opts) {
    this.level = opts.level
    this.showTime = opts.showTime ?? true
    this.showDiff = opts.showDiff ?? false
    this.diffToHumanTime = opts.diffToHumanTime
    this.#now = null
    this.formatTimestamp = opts.formatTime ?? ((date) => date.toISOString())
    this.decorations = {
      ...decorations,
      ...opts.decorations,
    }
    this.color = opts.color ?? false
    this.emoji = opts.emoji ?? false
    this.formatLevel =
      opts.formatLevel ??
      // to format `[emoji level]`
      ((level) => {
        let emoji = this.emoji ? this.pickEmoji(level) : ""
        emoji = emoji ? `${emoji} ` : ""
        const levelWithEmoji = `[${emoji}${this.#makeColorLevel(level)}]`

        return levelWithEmoji
      })

    /** @type {NonNullable<LoggerOptions['pickEmoji']>} */
    this.pickEmoji = opts.pickEmoji ?? ((level) => this.decorations[level].emoji)
  }

  /**
   *
   * @param {LevelKey} level
   * @returns {string}
   */
  #makeColorLevel(level) {
    const upperCasedLevel = level.toUpperCase()
    if (!this.color) {
      return upperCasedLevel
    }

    /** @type {import('node:util').InspectColor[] | null} */
    const color =
      level === "success"
        ? ["white", "bgGreen"]
        : level === "warn"
          ? ["black", "bgYellow"]
          : level === "error"
            ? ["white", "bgRed"]
            : null

    if (!color) {
      return upperCasedLevel
    }

    // console.log("level:", { upperCasedLevel, color })

    const colorLevel = styleText(color, ` ${upperCasedLevel} `)
    return colorLevel
  }

  /**
   * @param  {unknown[]} args
   */
  debug(...args) {
    if (this.level <= LEVEL.DEBUG) {
      this.#dispatch("debug", args)
    }
  }

  /**
   * @param  {...unknown} args
   */
  info(...args) {
    if (this.level <= LEVEL.INFO) {
      this.#dispatch("info", args)
    }
  }

  /**
   * @param  {...unknown} args
   */
  warn(...args) {
    if (this.level <= LEVEL.WARN) {
      this.#dispatch("warn", args)
    }
  }

  /**
   * @param  {...unknown} args
   */
  error(...args) {
    if (this.level <= LEVEL.ERROR) {
      this.#dispatch("error", args)
    }
  }

  /**
   * @param  {unknown[]} args
   */
  success(...args) {
    if (this.level <= LEVEL.INFO) {
      this.#dispatch("success", args)
    }
  }

  /**
   *
   * @param {LevelKey} level
   * @param {unknown[]} args
   * @param {Pick<LoggerOptions, 'formatLevel'>} pickEmoji
   */
  #dispatch(level, args, { formatLevel = this.formatLevel } = {}) {
    const leadings = [
      this.showTime && this.formatTimestamp(new Date()),
      // showDiff
      this.showDiff && this.#formatDiff(),
      formatLevel(level),
    ]
      .filter(Boolean)
      .join(" ")

    if (!this.color) {
      return console[level !== "success" ? level : "info"](leadings, ...args)
    }

    const color = this.decorations[level].color

    return console[level !== "success" ? level : "info"](leadings + color, ...args, BASH_COLORS.reset)
  }

  #formatDiff() {
    const diff = this.#now ? Date.now() - this.#now : 0
    this.#now = Date.now()

    const humanTime = this.#diffToHumanTime(diff)

    return `${BASH_COLORS.yellow}+${humanTime}${BASH_COLORS.reset}`
  }

  /**
   *
   * @param {int} diff
   * @returns
   */
  #diffToHumanTime(diff) {
    if (typeof this.diffToHumanTime === "function") {
      return this.diffToHumanTime(diff)
    }

    return `${diff.toLocaleString("en")}ms`
  }
}

/**
 *
 * @param {{ verbose: undefined | boolean }} param0
 */
export function createLogger({ verbose }) {
  return new Logger({
    level: verbose ? LEVEL.DEBUG : LEVEL.INFO,
    showTime: true,
    formatTime: (date) => date.toLocaleString(),
    diffToHumanTime: (diff) => {
      if (diff < 1000) {
        return `${diff}ms`
      }

      return `${Math.floor(diff / 1000)}.${String(diff % 1000).padStart(3, "0")}s`
    },
    // formatLevel: (level) => `[${level.toUpperCase()}]`,
    color: true,
    // emoji: true,
    showDiff: true,
  })
}

const isMain = () => {
  try {
    return import.meta.main
  } catch {
    return false
  }
}

if (isMain()) {
  const logger = createLogger({ verbose: true })

  logger.info("Hello from the wasteland.")
  logger.warn("Watch out for walkers.")
  logger.error("We lost another one.")

  const { setTimeout: sleep } = await import("node:timers/promises")

  logger.debug("Using consola 3.0.0")

  await sleep(100)
  logger.debug("Using consola", "3.0.0")

  await sleep(100)
  logger.debug("Using consola", "v", 3)

  await sleep(100)
  logger.info("Using consola", {
    string: "3.0.0",
    boolean: true,
    number: 123,
    array: [1, 2, 3],
    object: { a: 1, b: 2 },
  })

  await sleep(100)
  logger.warn("A new version of consola is available: 3.0.1")

  await sleep(1000)
  logger.success("Project built!")

  setTimeout(() => {
    logger.error(new Error("This is an example error. Everything is fine!"))
  }, 1000)
}
