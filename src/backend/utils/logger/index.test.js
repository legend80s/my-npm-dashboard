import { test } from "node:test"
import { setTimeout as sleep } from "node:timers/promises"
import { inspect } from "node:util"
import { BASH_COLORS, createLogger, LEVEL, Logger } from "./index.js"

test("new Logger - colorless", () => {
  const logger = new Logger({
    level: LEVEL.DEBUG,
  })

  logger.debug("Using consola 3.0.0")
  logger.debug("Using consola", "3.0.0")
  logger.debug("Using consola", "v", 3)

  logger.info("Using consola", {
    string: "3.0.0",
    boolean: true,
    number: 123,
    array: [1, 2, 3],
    object: { a: 1, b: 2 },
  })

  logger.warn("A new version of consola is available: 3.0.1")

  logger.success("Project built!")

  logger.error(new Error("This is an example error. Everything is fine!"))
})

// console.log("inspect.colors.red:", inspect.colors.red)

test("new Logger - with color and emoji", () => {
  const logger = new Logger({
    level: LEVEL.DEBUG,
    color: true,
    emoji: true,
    decorations: {
      // info: { emoji: "📣", color: `\x1b[${inspect.colors.bgBlue[0]}m` },
      info: { emoji: "📣", color: BASH_COLORS.brightBlue },
      debug: { emoji: "🐞", color: `\x1b[${inspect.colors.bgGray[0]}m` },
    },
  })

  logger.debug("Using consola 3.0.0")
  logger.debug("Using consola", "3.0.0")
  logger.debug("Using consola", "v", 3)

  logger.info("Using consola", {
    string: "3.0.0",
    boolean: true,
    number: 123,
    array: [1, 2, 3],
    object: { a: 1, b: 2 },
  })

  logger.warn("A new version of consola is available: 3.0.1")

  logger.success("Project built!")

  logger.error(new Error("This is an example error. Everything is fine!"))
})

test("createLogger", () => {
  const logger = createLogger({ verbose: false })

  logger.debug("Using consola 3.0.0")

  logger.debug("Using consola", "3.0.0")

  logger.debug("Using consola", "v", 3)

  logger.info("Using consola", {
    string: "3.0.0",
    boolean: true,
    number: 123,
    array: [1, 2, 3],
    object: { a: 1, b: 2 },
  })

  logger.warn("A new version of consola is available: 3.0.1")

  logger.success("Project built!")

  logger.error(new Error("This is an example error. Everything is fine!"))
})

test("createLogger print nothing", () => {
  const logger = createLogger({ verbose: false, level: LEVEL.NONE })

  logger.debug("Using consola 3.0.0")

  logger.debug("Using consola", "3.0.0")

  logger.debug("Using consola", "v", 3)

  logger.info("Using consola", {
    string: "3.0.0",
    boolean: true,
    number: 123,
    array: [1, 2, 3],
    object: { a: 1, b: 2 },
  })

  logger.warn("A new version of consola is available: 3.0.1")

  logger.success("Project built!")

  logger.error(new Error("This is an example error. Everything is fine!"))
})

test("createLogger verbose false", async () => {
  const logger = createLogger({ verbose: true })

  logger.info("Hello from the wasteland.")
  logger.warn("Watch out for walkers.")
  logger.error("We lost another one.")

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
})

test("createLogger verbose true", async () => {
  const logger = new Logger({
    level: LEVEL.INFO,
    color: true,
    showDiff: true,
    diffToHumanTime: (diff) => {
      if (diff < 1000) {
        return `+${diff}ms`.padStart(7, " ")
      }
      return `+${Math.floor(diff / 1000)}.${String(diff % 1000).padStart(3, "0")}s`
    },
  })

  logger.warn("A new version of walking-log is available: 0.0.5")
  await sleep(1000)
  logger.warn("A new version of walking-log is available: 0.0.5")
  await sleep(100)
  logger.warn("A new version of walking-log is available: 0.0.5")
  logger.error(new Error("This is an example error. Everything is fine!"))
})
