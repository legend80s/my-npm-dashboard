class BadgeDependencies extends HTMLElement {
  _rendered = false

  // 监听的属性变化
  static get observedAttributes() {
    return ["dependency-count"]
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
    const response = await fetch("./web-components/badge-dependencies/index.html")
    const template = await response.text()

    // console.log("template:", template)
    // throw new Error("error")

    const shadowRoot = /** @type {ShadowRoot} */ (this.shadowRoot)
    shadowRoot.innerHTML = template

    const name = this.getAttribute("name")

    if (!name) {
      const msg = "name is required"
      // @ts-expect-error
      shadowRoot.querySelector("img").alt = msg

      throw new Error("name is required")
    }

    // @ts-expect-error
    shadowRoot.querySelector("a").href =
      `https://www.npmjs.com/package/${encodeURIComponent(name)}?activeTab=dependencies`
  }

  // 属性变化时重新渲染
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "dependency-count") {
      // this.count = Number(newValue) || 0

      this.update()
    }
  }

  update() {
    if (!this._rendered) {
      return
    }

    const { color, level } = this.countLevel()
    const src = this.makeSrcByCountLevel(color)

    // @ts-expect-error
    const img = /** @type {HTMLImageElement} */ (this.shadowRoot.querySelector("img"))

    img.src = src
    img.title = `${level}: number of dependencies in package.json: 0 is "Excellent", 1 green for "Good", [2, 5] yellow for "Average" and [6, +∞] red for "Needs Improvement"`
  }

  /**
   * @param {string} color
   * @returns
   */
  makeSrcByCountLevel(color) {
    const countStr = this.getAttribute("dependency-count")
    return `https://img.shields.io/badge/dependencies-${countStr}-${color}`
  }
  /** 根据依赖数量计算颜色和等级 */
  countLevel() {
    let countStr = this.getAttribute("dependency-count")
    countStr = Number.isInteger(countStr) ? countStr : countStr
    // NaN will be red
    const count = Number(countStr)

    let color = "red"
    let level = "🔴 Needs Improvement"

    if (count <= 0) {
      color = "cyan"
      level = "👏 Excellent"
    } else if (count <= 1) {
      color = "green"
      level = "🟢 Good"
    } else if (count <= 5) {
      level = "🟡 Average"
      color = "yellow"
    }

    return { color, level }
  }
}

customElements.define("badge-dependencies", BadgeDependencies)
