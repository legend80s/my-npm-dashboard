import type { LevelKey, LevelNumber } from "./index.js"

export type LoggerOptions = {
  level: LevelNumber
  showTime?: boolean
  /** Show elapsed time since the previous message. */
  showDiff?: boolean
  toHumanTime?: (timeDiff: number) => string
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
