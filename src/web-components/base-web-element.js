export class BaseWebElement extends HTMLElement {
  /**
   * @template {keyof HTMLElementTagNameMap} K
   * @param {K} selector
   * @returns {HTMLElementTagNameMap[K]}
   */
  query(selector) {
    const element = this.shadowRoot?.querySelector(selector)
    if (!element) {
      throw new Error(`this.shadowRoot.querySelector("${selector}") not found`)
    }

    return element
  }
}
