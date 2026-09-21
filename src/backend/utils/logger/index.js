// import { consola } from "consola";
/** @typedef {number} int */

import { format, stripVTControlCharacters, styleText } from "node:util"

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
        ? ["black", "bgGreenBright"]
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
   * @returns {string | void}
   */
  debug(...args) {
    if (this.level <= LEVEL.DEBUG) {
      return this.#dispatch("debug", args)
    }
  }

  /**
   * @param  {...unknown} args
   */
  info(...args) {
    if (this.level <= LEVEL.INFO) {
      return this.#dispatch("info", args)
    }
  }

  /**
   * @param  {...unknown} args
   */
  warn(...args) {
    if (this.level <= LEVEL.WARN) {
      return this.#dispatch("warn", args)
    }
  }

  /**
   * @param  {...unknown} args
   */
  error(...args) {
    if (this.level <= LEVEL.ERROR) {
      return this.#dispatch("error", args)
    }
  }

  /**
   * @param  {unknown[]} args
   */
  success(...args) {
    if (this.level <= LEVEL.INFO) {
      return this.#dispatch("success", args)
    }
  }

  /**
   *
   * @param {LevelKey} level
   * @param {unknown[]} args
   * @param {Pick<LoggerOptions, 'formatLevel'>} pickEmoji
   * @returns {string}
   */
  #dispatch(level, args, { formatLevel = this.formatLevel } = {}) {
    const fLevel = formatLevel(level)
    // console.log("fLevel:", fLevel) // fLevel is [ WARN ] and with color code
    const leadings = [
      this.showTime && this.formatTimestamp(new Date()),
      // showDiff
      this.showDiff && this.#formatDiff(),
      fLevel,
    ]
      .filter(Boolean)
      .join(" ")

    // trim space around level
    const sfLevel = stripVTControlCharacters(fLevel)
    const journal = stripVTControlCharacters(format(leadings, ...args)).replace(
      sfLevel,
      sfLevel.replace("[ ", "[").replace(" ]", "]"),
    )

    if (!this.color) {
      console[level !== "success" ? level : "info"](leadings, ...args)
      return journal
    }

    const color = this.decorations[level].color

    console[level !== "success" ? level : "info"](leadings + color, ...args, BASH_COLORS.reset)

    return journal
  }

  #formatDiff() {
    const diff = this.#now ? Date.now() - this.#now : 0
    this.#now = Date.now()

    const humanTime = this.#diffToHumanTime(diff)

    if (!this.color) {
      return humanTime
    }

    return `${BASH_COLORS.yellow}${humanTime}${BASH_COLORS.reset}`
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

    return `+${diff.toLocaleString("en")}ms`
  }
}

export const defaultCreateLoggerConfig = {
  showTime: true,
  /**
   *
   * @param {Date} date
   * @returns
   */
  formatTime: (date) => date.toLocaleString(),
  /**
   *
   * @param {number} diff
   * @returns
   */
  diffToHumanTime: (diff) => {
    if (diff < 1000) {
      return `+${diff}ms`
    }

    return `+${Math.floor(diff / 1000)}.${String(diff % 1000).padStart(3, "0")}s`
  },
  // formatLevel: (level) => `[${level.toUpperCase()}]`,
  color: true,
  // emoji: true,
  showDiff: true,
}

/**
 * @param {Omit<LoggerOptions, 'level'> & { level?: LevelNumber; verbose?: boolean }} config
 */
export function createLogger({ verbose, ...rest } = {}) {
  return new Logger({
    level: verbose ? LEVEL.DEBUG : LEVEL.INFO,
    ...defaultCreateLoggerConfig,
    ...rest,
  })
}

if (import.meta.main) {
  const logger = createLogger({ verbose: false })
  const warnMsg = logger.warn("A new version of consola is available: 3.0.1")
  console.log(`warnMsg: |${warnMsg}}|`)

  const logger2 = createLogger({ verbose: false, color: false })
  const warnMsg2 = logger2.warn("A new version of consola is available: 3.0.1")
  console.log(`warnMsg2: |${warnMsg2}}|`)
}
