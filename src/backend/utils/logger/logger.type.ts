import type { LevelKey, LevelNumber } from "./index.js"

export type LoggerOptions = {
  /**
   * log level
   * debug < info < warn < error < none
   * none to disable all logs
   */
  level: LevelNumber
  showTime?: boolean
  /** Show elapsed time since the previous message. */
  showDiff?: boolean
  /**
   * Time diff to human readable string.
   * @param timeDiff the elapsed time since last log call
   * @returns
   */
  diffToHumanTime?: (timeDiff: number) => string
  formatTime?: (date: Date) => string
  formatLevel?: (level: LevelKey) => string

  /**
   * Should decorate with colors.
   * default `false`
   */
  color?: boolean
  /**
   * Should decorate with emojis.
   * default `false`
   */
  emoji?: boolean
  pickEmoji?: (level: LevelKey) => string
}
