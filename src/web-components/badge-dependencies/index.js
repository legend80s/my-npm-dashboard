class BadgeDependencies extends HTMLElement {
  // 监听的属性变化
  static get observedAttributes() {
    return ["dependency-count"]
  }

  constructor() {
    super()
    this.count = 0
    this.attachShadow({ mode: "open" })
  }

  async connectedCallback() {
    await this.render()
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

    this.update()
  }

  // 属性变化时重新渲染
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "dependency-count") {
      // this.count = Number(newValue) || 0

      this.update()
    }
  }

  update() {
    const { color, level } = this.countLevel()
    const src = this.makeSrcByCountLevel(color)

    // @ts-expect-error
    const img = /** @type {HTMLImageElement} */ (this.shadowRoot.querySelector("img"))

    img.src = src
    img.title = `${level}: Number of dependencies in package.json: 0 is excellent, 1 green, [2, 5] yellow and [6, +∞] red`
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
