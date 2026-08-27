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
