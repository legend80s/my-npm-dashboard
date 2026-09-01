import assert from "node:assert"

assert.ok(true, "assertion failed for true", 1, 2, 3)
// OK
assert.ok(1, "assertion failed for 1", 1, 2, 3)
// OK

assert.ok(false, "assertion failed for false", 1, 2, 3)
