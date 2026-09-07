import { execSync } from "node:child_process"
import { test } from "node:test"
import { createLogger, LEVEL, Logger } from "./index.js"

test("new Logger", () => {
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

test("#e2e logger", () => {
  execSync("node ./index.js", { stdio: "inherit" })
})
