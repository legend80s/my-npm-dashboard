const HOST_MAPPING = /** @type {const} */ ({
  npm: "https://www.npmjs.com",
  npmx: "https://npmx.dev",
  // maven: 'https://search.maven.org/artifact/',
  // pypi: 'https://pypi.org/project/',
  // rubygems: 'https://rubygems.org/gems/',
  // nuget: 'https://www.nuget.org/packages/',
  // docker: 'https://hub.docker.com/r/',
})

class BadgeDependencies extends HTMLElement {
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

  /**
   * @template {keyof HTMLElementTagNameMap} K
   * @param {K} selector
   * @returns {HTMLElementTagNameMap[K]}
   */
  #query(selector) {
    const element = this.shadowRoot?.querySelector(selector)
    if (!element) {
      throw new Error(`this.shadowRoot.querySelector("${selector}") not found`)
    }

    return element
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
    const provider = this.getAttribute("provider")
    // console.log("[badge-dependencies] provider:", provider)

    if (!name) {
      const msg = "name is required"
      this.#query("img").alt = msg

      throw new Error("name is required")
    }

    // @ts-expect-error
    const host = HOST_MAPPING[provider] || HOST_MAPPING.npm

    // Switch to npmx even if `?activeTab=dependencies` not take effect
    // Let user to click the dependencies link in npmx page.
    this.#query("a").href = `${host}/package/${name}?activeTab=dependencies`
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
      // @ts-expect-error
      const oldHost = HOST_MAPPING[oldValue]
      // @ts-expect-error
      const newHost = HOST_MAPPING[newValue]

      const a = this.#query("a")
      // console.log("[badge-dependencies] a:", a)
      // console.log("oldHost:", { oldHost, newHost })

      a.href = a.href.replace(oldHost, newHost)
    }
  }

  update() {
    const { color, level, icon } = this.countLevel()
    const src = this.makeSrcByCountLevel(color, icon)

    const img = this.#query("img")

    img.src = src
    img.title = `${icon} ${level}: number of dependencies in package.json: 0 is "Excellent", 1 green for "Good", [2, 5] yellow for "Average" and [6, +∞] red for "Needs Improvement"`
  }

  /**
   * @param {string} color
   * @param {string} icon
   * @returns
   */
  makeSrcByCountLevel(color, icon) {
    const countStr = this.getAttribute("dependency-count")
    return `https://img.shields.io/badge/${icon}%20dependencies-${countStr}-${color}`
  }
  /** 根据依赖数量计算颜色和等级 */
  countLevel() {
    let countStr = this.getAttribute("dependency-count")
    countStr = Number.isInteger(countStr) ? countStr : countStr
    // NaN will be red
    const count = Number(countStr)

    let color = "red"
    let icon = "🔴"
    let level = `Needs Improvement`

    if (count <= 0) {
      color = "cyan"
      level = "Excellent"
      icon = "👏"
    } else if (count <= 1) {
      color = "brightGreen"
      level = "Good"
      icon = "🟢"
    } else if (count <= 5) {
      level = "Average"
      icon = "🟡"
      color = "yellow"
    }

    return { color, level, icon }
  }
}

customElements.define("badge-dependencies", BadgeDependencies)
