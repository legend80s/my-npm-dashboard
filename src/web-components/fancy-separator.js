import { html } from "../utils/lit.js"

class FancySeparator extends HTMLElement {
  _rendered = false

  // 监听的属性变化
  // static get observedAttributes() {
  //   return ["dependency-count"]
  // }

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
    const template = html`
      <span>//</span>
    `

    // console.log("template:", template)
    // throw new Error("error")

    const shadowRoot = /** @type {ShadowRoot} */ (this.shadowRoot)
    shadowRoot.innerHTML = template
  }

  // 属性变化时重新渲染
  // attributeChangedCallback(name, oldValue, newValue) {
  //   if (name === "dependency-count") {
  //     // this.count = Number(newValue) || 0

  //     this.update()
  //   }
  // }

  update() {
    if (!this._rendered) {
      return
    }
  }
}

customElements.define("fancy-separator", FancySeparator)
