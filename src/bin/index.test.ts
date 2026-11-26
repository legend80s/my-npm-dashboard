import assert from "node:assert"
import { execSync } from "node:child_process"
import { test } from "node:test"

test("❯ node ./bin/index.js --dry-run", () => {
  const actual = execSync("node ./bin/index.js --dry-run 2>&1").toString()

  assert.doesNotMatch(actual, /error/i)
})
