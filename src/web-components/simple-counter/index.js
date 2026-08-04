class SimpleCounter extends HTMLElement {
  constructor() {
    super()
    this.count = 0
    this.attachShadow({ mode: "open" })
  }

  async connectedCallback() {
    // 动态加载模板
    const response = await fetch("./web-components/simple-counter/index.html")
    const template = await response.text()

    // console.log("template:", template)
    // throw new Error("error")

    const shadowRoot = /** @type {ShadowRoot} */ (this.shadowRoot)
    shadowRoot.innerHTML = template

    // 绑定事件
    // @ts-expect-error
    shadowRoot
      .querySelector("button")
      .addEventListener("click", () => this.openModal(shadowRoot))

    const createDrawer = shadowRoot.getElementById("createDrawer")

    // click outside to close
    shadowRoot.addEventListener("click", (event) => {
      // console.log('event.target:', event.target, event.currentTarget);
      if (createDrawer === event.target) {
        // @ts-expect-error
        createDrawer.close()
      }
    })

    shadowRoot
      .querySelector("#chartProviderWrapper")
      ?.addEventListener("change", (event) => {
        // Handle radio button change
        // console.log("Radio button changed:", event.target.value)

        const provider = /** @type {'npmx' | 'chart.js'} */ (
          // @ts-expect-error
          event.target.value
        )

        // 触发自定义事件（方便外部监听）
        this.dispatchEvent(
          new CustomEvent("chart-provider-change", {
            detail: { provider },
          }),
        )
      })

    // theme themeSwitcher
    shadowRoot
      .querySelector("#themeSwitcher")
      ?.addEventListener("change", (event) => {
        const theme = /** @type {'light' | 'dark'} */ (
          // @ts-expect-error
          event.target.value
        )
        // 触发自定义事件（方便外部监听）
        this.dispatchEvent(
          new CustomEvent("theme-change", {
            detail: { theme },
          }),
        )
      })
  }

  /**
   *
   * @param {ShadowRoot} shadowRoot
   */
  openModal = (shadowRoot) => {
    const createDrawer = shadowRoot.getElementById("createDrawer")

    // @ts-expect-error
    createDrawer.showModal()
  }
}

customElements.define("simple-counter", SimpleCounter)
