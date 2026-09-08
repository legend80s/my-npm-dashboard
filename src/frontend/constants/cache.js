export const CACHE_KEY_PREFIX = "my-npm-dashboard"
export const CACHE_KEY = `${CACHE_KEY_PREFIX}:pkgs`
export const KEY_PROVIDER = `${CACHE_KEY_PREFIX}:provider`
export const CACHE_TTL_IN_HOURS = 12 // 12小时
export const CACHE_TTL_IN_MS = CACHE_TTL_IN_HOURS * 60 * 60 * 1000 // 12小时（毫秒）

// export const KEYS = {
//   OPEN_SETTINGS: "open-settings",
//   THEME: "theme",
// }
