import { BaseWebElement } from "../base-web-element.js"

class BadgeDependencies extends BaseWebElement {
  _rendered = false

  // 监听的属性变化
  static get observedAttributes() {
    return ["dependency-count", "provider"]
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
  }

  async connectedCallback() {
    await this.render()
    this._rendered = true
    this.update()
  }

  async render() {
    // 动态加载模板
    const response = await window.originalFetch("./web-components/sonner-loader/index.html")
    const template = await response.text()

    // console.log("template:", template)
    // throw new Error("error")

    const shadowRoot = /** @type {ShadowRoot} */ (this.shadowRoot)
    shadowRoot.innerHTML = template
  }

  // 属性变化时重新渲染
  // @ts-expect-error
  attributeChangedCallback(name, oldValue, newValue) {
    if (!this._rendered) {
      return
    }
    // console.log("name, oldValue, newValue:", { name, oldValue, newValue })

    if (name === "dependency-count") {
      // this.count = Number(newValue) || 0

      this.update()
    }

    if (name === "provider") {
    }
  }

  update() {}
}

customElements.define("sonner-loader", BadgeDependencies)
