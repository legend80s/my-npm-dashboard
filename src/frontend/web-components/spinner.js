import { drawSearchingMascotSVG } from "../constants/icons.js"

export class Spinner {
  static #CLOCKS = ["🕛", "🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚"]

  /** @type {null | NodeJS.Timeout} */
  timer = null

  /**
   * @param {HTMLElement} root
   */
  constructor(root) {
    this.root = root
    this.id = crypto.randomUUID().replace(/^\d/, "n")
  }

  /**
   * @param {string} msg
   * @returns {void}
   */
  #render(msg) {
    const clocks = Spinner.#CLOCKS

    const searchingMascotSVG = drawSearchingMascotSVG({ verticalAlign: "-0.75em" })

    this.root.innerHTML = `<div id="${this.id}" class="no-results" style="color:var(--orange);">
      <span class="big xloading-spin">${clocks[0]}</span>
      ${searchingMascotSVG}
      ${msg}
    </div>`
  }

  /**
   * @param {string} msg
   * @returns {void}
   */
  start(msg) {
    this.#render(msg)

    const clocks = Spinner.#CLOCKS
    let index = 0
    this.timer = setInterval(() => {
      // Should always query spinner in the callback because it might be removed from the DOM
      const spinner = this.root.querySelector("span")
      // And if the spinner is not in the DOM, stop the timer
      // to prevent memory leaks
      if (!spinner) {
        if (this.timer) {
          clearInterval(this.timer)
          this.timer = null
        }
        return
      }

      index += 1
      spinner.innerHTML = /** @type {string} */ (clocks[index % clocks.length])
    }, 1000)
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null

      this.root.querySelector(`#${this.id}`)?.remove()
      // document.getElementById(this.id)?.remove()
    }
  }
}
