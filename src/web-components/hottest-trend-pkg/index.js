class HottestTrendPkg extends HTMLElement {
  constructor() {
    super()
    this.count = 0
    this.attachShadow({ mode: "open" })
  }

  async connectedCallback() {
    // 动态加载模板
    const response = await fetch("./web-components/hottest-trend-pkg/index.html")
    const template = await response.text()

    // console.log("template:", template)
    // throw new Error("error")

    const shadowRoot = /** @type {ShadowRoot} */ (this.shadowRoot)
    shadowRoot.innerHTML = template

    // 绑定事件
    // @ts-expect-error
    // shadowRoot
    //   .querySelector("button")
    //   .addEventListener("click", () => this.increment(shadowRoot))
  }

  /**
   *
   * @param {ShadowRoot} shadowRoot
   */
  increment = (shadowRoot) => {
    this.count++

    // @ts-expect-error
    shadowRoot.getElementById("c").textContent = this.count
  }
}

customElements.define("hottest-trend-pkg", HottestTrendPkg)
