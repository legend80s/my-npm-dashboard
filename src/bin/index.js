#!/usr/bin/env node

import { parseArgs } from "node:util"
import { startServer } from "../backend/dev-server/index.js"
import { createLogger } from "../backend/utils/logger/index.js"
import { openBrowser } from "../backend/utils/platform.js"
// import version and name from package.json
import pkg from "../package.json" with { type: "json" }

const { name, version, description } = pkg
const DEFAULT_PORT = 1123

/**
 * @satisfies {import('node:util').ParseArgsOptionsConfig}
 */
const options = {
  help: {
    type: "boolean",
    default: false,
    short: "h",
  },
  version: {
    type: "boolean",
    default: false,
    short: "v",
  },
  verbose: {
    type: "boolean",
    default: false,
    short: "V",
  },
  port: {
    type: "string",
    short: "p",
    default: String(DEFAULT_PORT),
    // @ts-expect-error
    description: "Port to run the server on",
  },
  open: {
    type: "boolean",
    short: "o",
    default: true,
    // @ts-expect-error
    description: "Open the server in the browser. --no-open to disable",
  },
}

const { values } = parseArgs({
  options,
  allowNegative: true,
})

const { verbose } = values
const logger = createLogger({ verbose })

async function main() {
  const { help, version, port, open } = values
  // console.log("values:", values)

  if (help) {
    console.log()
    printVersion()
    printHelp()
    return
  }

  if (version) {
    console.log()
    printVersion()
    return
  }

  const portNum = Number(port || process.env.PORT)
  // const rootDir = new URL("..", import.meta.url).pathname

  const { info } = await startServer({
    port: portNum || DEFAULT_PORT,
    // root: join(import.meta.dirname, "../"),
    // open, // 自动打开浏览器
  })

  const url = `http://localhost:${info.port}`

  console.log(`\nServer is running on ${url}\n`)

  if (open) {
    logger.debug("openBrowser url:", url)
    verbose && console.time("openBrowser")
    openBrowser(url, { debug: logger.debug })
      .catch((error) => {
        logger.error("openBrowser", error)
      })
      .finally(() => {
        verbose && console.timeEnd("openBrowser") // 486.144ms
      })
  }
}

main()

function printHelp() {
  console.log(`\n> ${description}\n`)
  console.table(options)
}

function printVersion() {
  console.log(`# ${name} v${version}`)
}
