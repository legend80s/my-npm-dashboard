import { getMaxSearchSize } from "../../utils/api.js"
import { KEY_OPEN_SETTINGS, LocalStorage } from "../../utils/cache.js"
// import { URLParams } from "../../utils/light-jquery.js"
import { BaseWebElement } from "../base-web-element.js"

/**
 * @import { Theme } from "../../index.type.js"
 */

const KEY = KEY_OPEN_SETTINGS

class SettingsDialog extends BaseWebElement {
  constructor() {
    super()
    this.count = 0
    this.attachShadow({ mode: "open" })

    // this.urlParams = new URLParams(window.location.href)

    this.storage = new LocalStorage()
  }

  async connectedCallback() {
    // 动态加载模板
    const response = await fetch("./web-components/settings-dialog/index.html")
    const template = await response.text()

    // console.log("template:", template)
    // throw new Error("error")

    const shadowRoot = /** @type {ShadowRoot} */ (this.shadowRoot)
    shadowRoot.innerHTML = template

    const open = this.storage.get(KEY)
    // console.log("open:", open)
    if (open) {
      this.openModal(false)
    }

    // 绑定事件
    this.query("button").addEventListener("click", () => this.openModal())

    const dialog = this.query("dialog")

    dialog.addEventListener("close", (event) => {
      // console.log("event:", event)
      this.storage.save(KEY, false)
    })

    // click outside to close
    shadowRoot.addEventListener("click", (event) => {
      // console.log('event.target:', event.target, event.currentTarget);
      if (dialog === event.target) {
        this.closeModal()
      }
    })

    shadowRoot.querySelector("#chartProviderWrapper")?.addEventListener("change", (event) => {
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
    shadowRoot.querySelector("#themeSwitcher")?.addEventListener("change", (event) => {
      const theme = /** @type {Theme} */ (
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

    // sync radio state with current theme
    const current = document.documentElement.getAttribute("data-theme") || "dark"
    const radio = /** @type {HTMLInputElement | null} */ (
      shadowRoot.querySelector(`#themeSwitcher input[value="${current}"]`)
    )
    if (radio) radio.checked = true

    // sync radio state with current chart provider
    const currentProvider = document.documentElement.getAttribute("data-provider") || "npm"
    const isNpmx = currentProvider === "npmx"
    const providerRadio = /** @type {HTMLInputElement | null} */ (
      shadowRoot.querySelector(`#chartProviderWrapper input[value="${isNpmx ? "npmx" : "chart.js"}"]`)
    )
    if (providerRadio) {
      providerRadio.checked = true
    }

    // sync max search size input
    const searchSizeInput = /** @type {HTMLInputElement} */ (shadowRoot.getElementById("maxSearchSizeInput"))
    searchSizeInput.value = String(getMaxSearchSize())

    // max search size
    searchSizeInput.addEventListener("change", () => {
      this.closeModal()
      this.dispatchEvent(
        new CustomEvent("max-search-size-change", {
          detail: { size: Number(searchSizeInput.value) },
        }),
      )
    })
  }

  openModal = (addOpen = true) => {
    const dialog = this.query("dialog")
    addOpen && this.storage.save(KEY, true)
    // addOpen && this.urlParams.replace(KEY, "true")

    dialog.showModal()
  }

  closeModal = () => {
    this.query("dialog").close()
  }
}

customElements.define("settings-dialog", SettingsDialog)
