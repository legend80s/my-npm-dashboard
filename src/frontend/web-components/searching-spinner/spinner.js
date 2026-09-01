import { drawElephantMascotFlippingThroughSVG, drawPackageSearchSvg } from "../../constants/icons.js"
import { html } from "../../utils/lit.js"

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

    const searchingMascotSVG = drawRandomSearchingMascotSVG()

    this.root.innerHTML = html`<div id="${this.id}" class="no-results" style="">
      <style>
        .searching-mascot {
          /* 变大到恢复大小的呼吸效果 */
          /* animation: scale 2s ease-in-out 0s infinite alternate; */
          /* animation: pulse 3s ease-in-out infinite alternate; */
          transition: rotate 0.25s;
          &:hover {
            rotate: -1.4deg;
          }
        } 

        @keyframes pulse {
          0% {
            /* transform: scale(1); */
            /* opacity: 0.70; */
            rotate: 0deg;
          }
          50% {
            rotate: -1.4deg;
            /* opacity: 1; */
            /* transform: scale(1.03); */
          }
          100% {
            /* transform: scale(1); */
            /* opacity: 0.70; */
            rotate: 0deg;
          }
        }

        /* 定义放大和缩回的关键帧 */
        @keyframes scale {
          from {
            transform: scale(1); /* 原始大小 */
            /* opacity: 0.57; */
          }

          to {
            transform: scale(1.02); /* 放大到 1.1 倍 */
            /* opacity: 1; */
          }
        }

        .shimmer {
          font-size: 1.25rem;
          font-weight: bold;
          color: #33333357;
          /* 关键：文字作为遮罩 */
          background: linear-gradient(
            90deg,
            /* currentColor 0%, */
            var(--accent-green) 0%,
            currentColor 40%,
            currentColor 45%,
            #fff 50%, /** 扫光宽度 10% = (50-45)+(55-50) = 5 + 5 = 10 */
            /* var(--accent-green) 50%, */
            currentColor 55%,
            currentColor 60%,
            currentColor 100%
          );
          
            /* background: linear-gradient(
            90deg,
            #ff6b6b 0%,
            #feca57 25%,
            #48dbfb 50%,
            #ff9ff3 75%,
            #ff6b6b 100%
          ); */

          background-size: 300% 100%;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 12s infinite linear;
        }

        @keyframes shimmer {
          0% {
            background-position: 300% 0;
          }
          100% {
            background-position: -300% 0;
          }
        }

        /* 当用户开启“减少动画”时，关闭动画，减少“动画焦虑/烦躁症” */
        @media (prefers-reduced-motion: reduce) {
          .shimmer {
            animation: none;
            background-clip: revert;
            -webkit-text-fill-color: revert;
            background: none;
            color: inherit;
          }

          .searching-mascot {
            animation: none;

            &:hover {
              rotate: 0deg;
            }
          }
        }
      </style>
      <p class="big xloading-spin">${searchingMascotSVG}</p>

      <span class='clock' style="display: inline-block; font-size: 2.5rem; vertical-align: sub; margin-right: 0;">${clocks[0]}</span>

      <span class="shimmer">${msg}</span>
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
      const spinner = this.root.querySelector(".clock")
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

/**
 * @returns {import('../../constants/icons.type.js').SVGString}
 */
function drawRandomSearchingMascotSVG() {
  // lazy called functions for cpu efficiency
  const svgs = [
    () => drawElephantMascotFlippingThroughSVG({ width: "2.5em" }, "searching-mascot"),
    () => drawPackageSearchSvg({ width: "2em" }, "searching-mascot"),
  ]

  const randIndex = Math.floor(Math.random() * svgs.length)

  const randomOne = svgs[randIndex]?.()

  assert(randomOne)

  return randomOne
}

/**
 * @param {unknown} value
 * @param {string} msg
 * @returns {asserts value is NonNullable<typeof value>}
 */
function assert(value, msg = `Expected 'val' to be truthy, but received ${value} of type ${typeof value}`) {
  if (!value) {
    throw new Error(msg)
  }
}
