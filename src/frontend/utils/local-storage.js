import { CACHE_KEY_PREFIX } from "../constants/cache.js"

// ============================================================
//  11. 缓存管理（localStorage）
// ============================================================
/**
 * @typedef { 'open-settings' | 'theme' | 'provider' } Key
 */

/**
 * @template [T=Key]
 */
export class LocalStorage {
  constructor(namespace = CACHE_KEY_PREFIX) {
    this.namespace = namespace
  }

  /** @param {T} key  */
  #genKey(key) {
    return `${this.namespace}:${key}`
  }

  /**
   *
   * @param {T} key
   * @param {unknown} value
   */
  save(key, value) {
    localStorage.setItem(this.#genKey(key), JSON.stringify(value))
  }

  /**
   *
   * @param {T} key
   * @returns {unknown}
   */
  get(key) {
    const cached = localStorage.getItem(this.#genKey(key))
    if (!cached) {
      return null
    }

    return JSON.parse(cached)
  }
}
