export const CACHE_KEY_PREFIX = "my-npm-dashboard"
export const CACHE_KEY = genKey(`pkgs`)
export const KEY_PROVIDER = genKey(`provider`)
export const CACHE_TTL_IN_HOURS = 12 // 12小时
export const CACHE_TTL_IN_MS = CACHE_TTL_IN_HOURS * 60 * 60 * 1000 // 12小时（毫秒）
export const MAX_SEARCH_SIZE_KEY = genKey("maxSearchSize")

/**
 * @param {string} key
 * @returns {string}
 */
export function genKey(key) {
  return `${CACHE_KEY_PREFIX}:${key}`
}

// export const KEYS = {
//   OPEN_SETTINGS: "open-settings",
//   THEME: "theme",
// }
