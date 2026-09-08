// Copy from https://github.com/honojs/hono/blob/main/src/middleware/logger/index.ts
// Change Incoming and Outgoing prefix to arrows emoji, and add color to them.

import { styleText } from "node:util"
import { getColorEnabledAsync } from "hono/utils/color"

/** @typedef {(str: string, ...rest: string[]) => void} PrintFunc */
/** @import { MiddlewareHandler } from 'hono/types' */

const LogPrefix = {
  Outgoing: "→",
  Incoming: "←",
  Error: "xxx",
}

/**
 *
 * @param {string[]} times
 * @returns
 */
var humanize = (times) => {
  const [delimiter, separator] = [",", "."]

  // biome-ignore lint/style/useTemplate: copy from hono
  const orderTimes = times.map((v) => v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + delimiter))

  return orderTimes.join(separator)
}
/**
 *
 * @param {number} start
 * @returns
 */
var time = (start) => {
  const delta = Date.now() - start
  // biome-ignore lint/style/useTemplate: copy from hono
  return humanize([delta < 1e3 ? delta + "ms" : Math.round(delta / 1e3) + "s"])
}
/**
 *
 * @param {number} status
 * @returns
 */
var colorStatus = async (status) => {
  const colorEnabled = await getColorEnabledAsync()
  if (colorEnabled) {
    switch ((status / 100) | 0) {
      case 5: // red = error
        return `\x1B[31m${status}\x1B[0m`
      case 4: // yellow = warning
        return `\x1B[33m${status}\x1B[0m`
      case 3: // cyan = redirect
        return `\x1B[36m${status}\x1B[0m`
      case 2: // green = success
        return `\x1B[32m${status}\x1B[0m`
    }
  }
  return `${status}`
}

/**
 * @param {PrintFunc} fn
 * @param {string} prefix
 * @param {string} method
 * @param {string} path
 * @param {number} status
 * @param {string} [elapsed]
 */
async function log(fn, prefix, method, path, status = 0, elapsed) {
  const incoming = styleText("cyan", prefix)
  const statusColor = status >= 400 ? "red" : "green"
  const outgoing = styleText(statusColor, prefix)

  const out =
    prefix === LogPrefix.Incoming /* Incoming */
      ? `${incoming} ${method} ${path}`
      : `${outgoing} ${method} ${path} ${await colorStatus(status)} ${elapsed}`
  fn(out)
}

/**
 * /**
 * Logger Middleware for Hono.
 *
 * @see {@link https://hono.dev/docs/middleware/builtin/logger}
 *
 * @param {PrintFunc} [fn=console.log] - Optional function for customized logging behavior.
 * @returns {MiddlewareHandler} The middleware handler function.
 *
 * @example
 * ```ts
 * const app = new Hono()
 *
 * app.use(logger())
 * app.get('/', (c) => c.text('Hello Hono!'))
 * ```
 */
export const logger = (fn = console.log) => {
  return async function logger2(c, next) {
    const { method, url } = c.req
    const path = url.slice(url.indexOf("/", 8))
    await log(fn, LogPrefix.Incoming /* Incoming */, method, path)
    const start = Date.now()
    await next()
    await log(fn, LogPrefix.Outgoing /* Outgoing */, method, path, c.res.status, time(start))
  }
}
