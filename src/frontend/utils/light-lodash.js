/**
 * @returns {boolean}
 */
export function isMain() {
  try {
    return import.meta.main
  } catch {
    return false
  }
}

/**
 * @param {Partial<CSSStyleProperties>} cssProps
 * @return {string}
 */
export function stylish(cssProps) {
  return Object.entries(cssProps)
    .map(([key, value]) => `${toHyphenCase(key)}: ${value};`)
    .join(" ")
}

/**
 * @param {string} cssPropKey
 */
function toHyphenCase(cssPropKey) {
  return cssPropKey.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
}

/**
 *
 * @param {Function} func
 * @param {number} delay
 * @returns
 */
export function debounce(func, delay = 0) {
  /** @type {NodeJS.Timeout} */
  let timer

  /**
   * @param  {...unknown} args
   * @this {unknown}
   */
  return function debounced(...args) {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
