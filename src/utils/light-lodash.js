/** @import { int } from './base.type.js' */
const YELLOW = `\x1b[33m`
const RESET = `\x1b[0m`

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
    throw new Error(
      `[fetchJSON]${label} "${url}" failed, status: ${res.status}`,
    )
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
