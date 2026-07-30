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
