import { getLocale, isChinese } from "../../frontend/utils/locales.js"

/** @import { int } from '../../frontend/utils/base.type.js' */

export const YELLOW = `\x1b[33m`
export const RED = `\x1b[31m`
export const RESET = `\x1b[0m`

/**
 *
 * @param {int} ms
 * @returns {Promise<int>} the actual time it took to sleep
 */
export function sleep(ms) {
  const start = Date.now()
  return new Promise((resolve) => setTimeout(() => resolve(Date.now() - start), ms))
}

/**
 * @param {string} url
 * @param {{ label: string; verbose?: boolean }} options
 * @returns {Promise<unknown>}
 */
export async function fetchJSON(url, { label, verbose = false }) {
  if (verbose) {
    console.log(`${YELLOW}  [fetchJSON]`, label, url, RESET)
  }
  const res = await fetch(url)

  label = label ? ` ${label}` : ""

  if (!res.ok) {
    // console.error(res)
    /** @type {string | null} */
    const text = await safeAsyncCall(async () => await res.text())
    throw new Error(`[fetchJSON]${label} "${url}" failed, status: ${res.status}, resp: ${text}`)
  }

  const data = await res.json()

  return data
}

const rtf = new Intl.RelativeTimeFormat(isChinese() ? "zh-CN" : "en-US", { numeric: "auto" })

const DIVISIONS = /** @type {const} */ ([
  { amount: 60, name: "seconds" },
  { amount: 60, name: "minutes" },
  { amount: 24, name: "hours" },
  { amount: 7, name: "days" },
  { amount: 4.34524, name: "weeks" },
  { amount: 12, name: "months" },
  { amount: Infinity, name: "years" },
])

/**
 *
 * @param {Date} date
 * @returns {string}
 */
export function timeAgo(date) {
  const secondsAgo = (date.getTime() - Date.now()) / 1000
  let duration = secondsAgo

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.name)
    }
    duration /= division.amount
  }

  console.error("[timeAgo] Impossible branch reached", {
    date,
    duration,
    secondsAgo,
  })
  throw new Error("Impossible branch reached")
}

/**
 *
 * @param {int | null} num
 * @param {Parameters<typeof Number.prototype.toLocaleString>[0]} locale
 * @returns
 */
export function numberToLocaleString(num, locale = getLocale()) {
  if (num === null) {
    return "-"
  }

  if (locale === "zh-CN") {
    return numberToChineseWan(num)
  }

  return num.toLocaleString(locale)
}

/**
 *
 * @param {int} num
 * @returns {string}
 */
function numberToChineseWan(num, depth = 1) {
  if (num < 1_0000) {
    return num.toString()
  }

  let unit = " 万 "
  if (depth >= 2) {
    unit = " 亿 "
  }

  const wan = Math.floor(num / 1_0000)
  const qian = num % 1_0000

  return `${numberToChineseWan(wan, depth + 1)}${unit}${qian}`
}

if (import.meta.main) {
  const { test } = await import("node:test")
  const { deepStrictEqual } = await import("node:assert")

  test("numberToChineseWan", () => {
    // @ts-expect-error
    deepStrictEqual(numberToChineseWan(305_3975), "305 万 3975")
    // @ts-expect-error
    deepStrictEqual(numberToChineseWan(3975), "3975")
    // @ts-expect-error
    deepStrictEqual(numberToChineseWan(1_2305_3975), "1 亿 2305 万 3975")
    // @ts-expect-error
    deepStrictEqual(numberToChineseWan(2305_3975), "2305 万 3975")
  })
}

/**
 * @template T
 * @param {() => T} syncFunc
 * @returns {T | null}
 */
export function safeCall(syncFunc) {
  try {
    return syncFunc()
  } catch (_error) {
    return null
  }
}

/**
 * @template T
 * @param {() => Promise<T>} asyncFunc
 * @returns {Promise<T | null>}
 */
export async function safeAsyncCall(asyncFunc) {
  try {
    return await asyncFunc()
  } catch (_error) {
    return null
  }
}

if (import.meta.main) {
  const { test } = await import("node:test")
  const { deepStrictEqual } = await import("node:assert")

  test("safeAsyncCall", () => {
    // @ts-expect-error
    deepStrictEqual(
      safeAsyncCall(() => Promise.resolve(1)),
      1,
    )
    // @ts-expect-error
    deepStrictEqual(
      safeAsyncCall(() => Promise.reject(1)),
      null,
    )
  })
}
