import { BaseWebElement } from "../base-web-element.js"

const componentName = "sonner-loader"

class BadgeDependencies extends BaseWebElement {
  constructor() {
    super()
    this.attachShadow({ mode: "open" })
  }

  async connectedCallback() {
    await this.render()
  }

  async render() {
    // 动态加载模板
    /** @type {string} */
    const template = await this.fetchTemplate(componentName)

    // console.log("template:", template)
    // throw new Error("error")

    const shadowRoot = /** @type {ShadowRoot} */ (this.shadowRoot)
    shadowRoot.innerHTML = template
  }
}

customElements.define(componentName, BadgeDependencies)
