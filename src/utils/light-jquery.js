/**
 *
 * @param {string} selector
 * @returns
 */
export function $(selector) {
  return document.querySelector(selector)
}

/**
 *
 * @param {string} selector
 * @returns
 */
export function $$(selector) {
  return document.querySelectorAll(selector)
}

/**
 *
 * @param {HTMLElement} element
 * @param {Partial<{ offsetTop: number, behavior: ScrollBehavior, align: "top" | 'center' | 'bottom' }>} options
 */
export function scrollToElement(element, options = {}) {
  // const element = document.getElementById(id)
  // if (!element) return

  const { offsetTop = 0, behavior = "smooth", align = "top" } = options

  const rect = element.getBoundingClientRect()
  const currentScrollY = window.scrollY
  const viewportHeight = window.innerHeight

  let targetY
  switch (align) {
    case "top":
      targetY = rect.top + currentScrollY + offsetTop
      break
    case "center":
      targetY = rect.top + currentScrollY - viewportHeight / 2 + rect.height / 2 + offsetTop
      break
    case "bottom":
      targetY = rect.bottom + currentScrollY - viewportHeight + offsetTop
      break
    default:
      targetY = rect.top + currentScrollY + offsetTop
  }

  window.scrollTo({
    top: targetY,
    behavior,
  })

  // console.log(`滚动到 ${id}，位置: ${targetY}px`)
}

/**
 * URL SearchParams 工具类
 */
export class URLParams {
  constructor(href = window.location.href) {
    this.url = new URL(href)
  }
  /**
   * 设置参数（添加到历史记录）
   * @param {string} key
   * @param {string} value
   */
  set(key, value) {
    const url = this.url
    url.searchParams.set(key, value)
    window.history.pushState({}, "", url)
  }

  /**
   * 设置参数（不添加到历史记录）
   * @type {InstanceType<typeof URLParams>['set']}
   */
  replace(key, value) {
    this.url.searchParams.set(key, value)
    window.history.replaceState({}, "", this.url)
  }

  /**
   * 批量设置参数
   * @param {Record<string, string>} params
   */
  setMultiple(params) {
    const url = this.url
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
    window.history.pushState({}, "", url)
  }

  /**
   * 删除参数
   * @param {string} key
   */
  remove(key) {
    const url = this.url
    url.searchParams.delete(key)
    window.history.pushState({}, "", url)
  }

  /**
   * 批量删除参数
   * @param {string[]} keys
   */
  removeMultiple(keys) {
    const url = this.url
    keys.forEach((key) => url.searchParams.delete(key))
    window.history.pushState({}, "", url)
  }

  /**
   * 获取参数值
   * @param {string} key
   */
  get(key) {
    return this.url.searchParams.get(key)
  }

  /**
   * 获取所有参数
   */
  getAll() {
    /** @type {Record<string, string>} */
    const params = {}
    const searchParams = this.url.searchParams
    for (const [key, value] of searchParams) {
      params[key] = value
    }
    return params
  }

  /**
   * 清空所有参数
   */
  clear() {
    const url = new URL(window.location.href)
    url.search = ""
    window.history.pushState({}, "", url)
  }

  /**
   * 切换参数（存在则删除，不存在则添加）
   * @type {import('../index.type.js').SetParamFn}
   */
  toggle(key, value) {
    const url = this.url
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key)
    } else {
      url.searchParams.set(key, value)
    }
    window.history.pushState({}, "", url)
  }
}
