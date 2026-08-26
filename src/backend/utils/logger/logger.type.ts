import type { LevelKey, LevelNumber } from "./index.js"

export type LoggerOptions = {
  level: LevelNumber
  withTimestamp?: boolean
  formatTimestamp?: (date: Date) => string
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
