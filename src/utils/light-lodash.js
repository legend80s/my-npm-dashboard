/** @import { int } from './base.type.js' */
export const YELLOW = `\x1b[33m`
export const RED = `\x1b[31m`
export const RESET = `\x1b[0m`

/**
 *
 * @param {int} ms
 * @returns
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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
    throw new Error(`[fetchJSON]${label} "${url}" failed, status: ${res.status}`)
  }

  const data = await res.json()

  return data
}

const rtf = new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" })

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
 * @param {int} num
 * @param {Parameters<typeof Number.prototype.toLocaleString>[0]} locale
 * @returns
 */
export function numberToLocaleString(num, locale = navigator.language) {
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
