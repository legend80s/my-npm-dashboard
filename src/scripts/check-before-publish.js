// If files count to publish is less or more than previous published files count by an threshold, exit with error
// because it usually shows sign of error which means there is many files missing or extra files added by mistake
// use `npm pack --dry-run`

import assert from "node:assert"
import { execSync } from "node:child_process"
import readline from "node:readline"
import { parseArgs } from "node:util"
import { createLogger } from "walking-log"
import { fetchJSON } from "../shared/utils/light-lodash.js"

/** @typedef {number} int */

const DEFAULT_THRESHOLD = 5
const pkgName = "npm-calf"
const testing = false

// abort if there is any error
const { values } = parseArgs({
  allowNegative: true,
  options: {
    verbose: {
      type: "boolean",
      default: false,
    },
    // TODO version and help
    threshold: { type: "string", default: String(DEFAULT_THRESHOLD), description: "the threshold" },
    // throws when threshold overflow
    throw: {
      type: "boolean",
      default: true,
      description:
        "Should exit with error when files count to publish is less or more than previous published files count by an threshold?",
    },
  },
})

const colors = {
  RED: "\x1b[31m",
  GREEN: "\x1b[32m",
  CYAN: "\x1b[36m",
  RESET: "\x1b[0m",
}

const logger = createLogger({
  verbose: values.verbose,
})

async function main() {
  await check()
}
async function check() {
  const { diff, version, totalFiles, prevFileCount, prevVersion } = await fetchDiff()
  const threshold = Number(values.threshold)

  if (Math.abs(diff) > threshold) {
    handleThresholdExceeded()
  }

  async function handleThresholdExceeded() {
    const msg1 =
      `To publish ` +
      red(`v${version}`) +
      ` files count is ${red(totalFiles)}, but previous published ` +
      green(`v${prevVersion}`) +
      ` files count is ${green(prevFileCount)}.`
    logger.error(colors.RESET + msg1 + colors.RESET)

    const msg2 = `The diff (Math.abs(${totalFiles} - ${prevFileCount}) = ${diff}) ${red("❯")} threshold (${threshold}).`
    logger.error(colors.RESET + msg2 + colors.RESET)

    const msg3 = `This usually shows sign of error which means there are many files missing or extra files added by mistake.`
    logger.error(msg3)

    const isInteractive = process.stdin.isTTY

    const fileCountOverThresholdError = `FileCountOverThresholdError: previous published files count (${prevFileCount}) is too different from to publish files count (${totalFiles}).`

    if (!isInteractive) {
      logger.debug("Not interactive mode")
      if (values.throw) {
        logger.debug("  Exit with error")
        throw new Error(fileCountOverThresholdError)
      }

      logger.debug("  Exit with error log only")
    } else {
      const answer = await confirmInteractive(`\nIf it's OK to continue publishing enter "yes", "n" to abort.\n❯ `)
      if (answer !== "yes") {
        logger.debug("Aborted by user.\n")

        throw new Error(fileCountOverThresholdError)
      }
    }
  }
}
async function fetchDiff() {
  const timeLabel = `[check-before-publish] ${pkgName}`
  console.time(timeLabel)

  try {
    return await fetchDiffCore()
  } finally {
    console.log()
    console.timeEnd(timeLabel)
    console.log()
  }
}

async function fetchDiffCore() {
  const { latestVersionFileCount: prevFileCount, latestVersion: prevVersion } =
    await getPrevPublishedFilesCount(pkgName)

  logger.info(`Previous published v${prevVersion} files count is`, prevFileCount)

  const tarballDetails = await getToPublishFilesCount()

  const { name, entryCount: totalFiles, version } = tarballDetails

  if (name !== pkgName) {
    throw new Error(
      `Tarball name mismatch. Expected "${pkgName}", but got "${name}". Check if \`npm pack --dry-run\` ran in the wrong directory.`,
    )
  }

  if (version === prevVersion) {
    throw new Error(
      `Version to publish v${version} should not the same with prev version v${prevVersion}. Check if \`npm pack --dry-run\` ran in the wrong directory.`,
    )
  }

  logger.info(`To publish ${name} v${version} files count is`, totalFiles)

  const diff = totalFiles - prevFileCount

  return { diff, prevVersion, prevFileCount, totalFiles, version }
}

/**
 * 交互式：通过 readline 询问
 * @param {string} question
 * @return {Promise<string>}
 */
function confirmInteractive(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    rl.on("SIGINT", () => {
      rl.close()
      console.log()
      logger.error("❌ Aborted.\n")
      process.exit(1)
    })

    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim().toLowerCase())
    })
  })
}

main()

/**
 * @param {string} pkgName
 * @returns {Promise<{ latestVersionFileCount: int, latestVersion: string }>}
 */
async function getPrevPublishedFilesCount(pkgName) {
  // mock code for testing to avoid rate limit
  if (testing) {
    return {
      latestVersion: "1.2.0",
      latestVersionFileCount: 83,
    }
  }
  // read from npm registry
  const json = /** @type {import('../frontend/utils/npmjs.type.js').NpmPkgResp} */ (
    await fetchJSON(`https://registry.npmjs.org/${pkgName}`)
  )

  const latestVersion = json["dist-tags"].latest
  const latestVersionFileCount =
    // @ts-expect-error
    json.versions[latestVersion].dist.fileCount

  return { latestVersionFileCount, latestVersion }
}

/**
 * @returns {Promise<{ name: string, version: string, entryCount: int }>}
 */
async function getToPublishFilesCount() {
  if (testing) {
    return {
      name: pkgName,
      version: "1.3.0",
      entryCount: 659,
    }
  }
  const stdout = execSync(`npm pack --dry-run --json`).toString("utf-8")

  const parsed = /** @type {import('./check.type.js').NpmPackDryRunJSON} */ (JSON.parse(stdout))

  assert(parsed[0])

  return parsed[0]
}

/**
 * @param {string | number} val
 * @returns {string}
 */
function red(val) {
  return colors.RED + val + colors.RESET
}

/** @type {typeof red} */
function green(val) {
  return colors.GREEN + val + colors.RESET
}

/** @type {typeof red} */
function cyan(val) {
  return colors.CYAN + val + colors.RESET
}
