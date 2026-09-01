import { execSync } from "node:child_process"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { styleText } from "node:util"

const root = "."
const template = `${root}/frontend/web-components/copyright-footer/index.js`

let webComponentName = process.argv[2]
const dryRun = process.argv.includes("--dry-run")
// console.log('process.argv:', process.argv);

const red = "\x1b[31m"
const green = "\x1b[32m"
const reset = "\x1b[0m"

// @ts-expect-error
const log = (message) => console.log(message)
// @ts-expect-error
const success = (message, color = green) => console.log(color + message + reset)
// @ts-expect-error
const err = (message) => console.error(red + message + reset)

if (!webComponentName) {
  err("Please provide a web component name as an argument.")
  process.exit(1)
}

// should begin with a lowercase letter and contain only lowercase letters, hyphens, and numbers
webComponentName = webComponentName.replace(/^[A-Z]/, (match) => `-${match.toLowerCase()}`)

// copy the js file from src/frontend/web-components/copyright-footer/index.js to src/frontend/web-components/${webComponentName}/index.js and

function main() {
  const label = `⏳ Creating web component "${green}${webComponentName}${reset}" ✅`
  console.time(label)
  create()
  console.timeEnd(label)

  console.log()

  // next import it in src/frontend/index.js and use it in src/frontend/index.html
  log(
    `✅ Next, import it in ${styleText("underline", "src/frontend/index.js")} and use it in ${styleText("underline", "src/frontend/index.html")}`,
  )
  log(`1. ${styleText("white", `import './web-components/${webComponentName}/index.js'`)}`)
  log(`2. ${styleText("white", `<${webComponentName}></${webComponentName}>`)}`)
}

main()

function create() {
  const newDirPath = `${root}/frontend/web-components/${webComponentName}`

  if (!dryRun) {
    mkdirSync(newDirPath)
  } else {
    log(`Creating directory: ${newDirPath}`)
  }

  if (!dryRun) {
    execSync(`cp ${template} ${newDirPath}`)
  } else {
    log(`Copying file: ${template} to ${newDirPath}`)
  }

  const newFilePath = `${newDirPath}/index.js`

  // replace name from copyright-footer to ${webComponentName} in src/frontend/web-components/${webComponentName}/index.js use node.js

  if (!dryRun) {
    const fileContent = readFileSync(newFilePath).toString("utf-8")
    // @ts-expect-error
    writeFileSync(newFilePath, fileContent.replace(/copyright-footer/g, webComponentName))
  } else {
    log(`Replacing name from copyright-footer to ${webComponentName} in ${newFilePath}\n`)
  }
}
