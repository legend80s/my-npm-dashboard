import { sleep } from "../../shared/utils/light-lodash.js"

/** @import { InferElementType } from '../utils/base.type.js' */

export class BaseWebElement extends HTMLElement {
  /**
   * @template {(string & {}) | keyof HTMLElementTagNameMap} K
   * @param {K} selector
   * @returns {K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : InferElementType<K>}
   */
  query = (selector) => {
    const element = this.#queryCore(selector)

    // @ts-expect-error
    return element
  }

  /**
   *
   * @param {string} selector
   * @param {{throwErrorOnNil?: boolean}} options
   * @returns
   */
  #queryCore(selector, { throwErrorOnNil = true } = {}) {
    const element = this.shadowRoot?.querySelector(selector)
    if (!element && throwErrorOnNil) {
      throw new Error(`this.shadowRoot.querySelector("${selector}") not found`)
    }

    return element
  }

  /**
   * @template {(string & {}) | keyof HTMLElementTagNameMap} K
   * @param {K} selector
   * @returns {Promise<K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : InferElementType<K>>}
   */
  async queryAsync(selector) {
    const GAP_IN_MS = 100

    for (let i = 0; i < 10; i++) {
      const element = this.#queryCore(selector, { throwErrorOnNil: false })
      if (element) {
        // @ts-expect-error
        return element
      }

      await sleep(GAP_IN_MS)
    }

    throw new Error(`this.shadowRoot.querySelector("${selector}") not found`)
  }

  /**
   * @template {string} T
   * @param {import('../index.type.js').FolderName<T>} folderName - no dot. Example: 'my-component'
   * @returns
   * @example
   * this.fetchTemplate('my-component') // √
   * this.fetchTemplate("./web-components/sonner-loader/index.html") // ×
   */
  async fetchTemplate(folderName) {
    const fetch = window.originalFetch || window.fetch
    const template = await fetch(`./web-components/${folderName}/index.html`).then((resp) => resp.text())

    return template
  }
}
