// @ts-expect-error
import { boot, toast as rawToast } from "sourdough-toast"

/** @import { ToastFunction, IPatchFetch } from './sonner.type.js' */

const showToast = /** @type {ToastFunction} */ (rawToast)

/**
 * 挂载 fetch 代理：每次请求弹一个 toast，完成后关闭
 * @type {IPatchFetch}
 */
function patchFetch() {
  // @ts-expect-error
  if (patchFetch.done) {
    return
  }
  // @ts-expect-error
  patchFetch.done = true

  const originalFetch = window.fetch
  window.originalFetch = originalFetch

  window.fetch = function (...args) {
    const [input] = args
    // @ts-expect-error
    const url = typeof input === "string" ? input : input?.url || ""

    const promise = originalFetch.apply(this, args)
    if (!url) {
      return promise
    }

    // 长 duration 兜底：慢请求在 settle 前不会被自动关闭
    // console.log("showToast:", showToast)
    const div = document.createElement("div")
    // const spinner = `<svg class="refresh-icon x-text-muted" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    //         <path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.098A5.5 5.5 0 0 0 8 2.5Z"></path>
    //       </svg>`
    const spinner = `<sonner-loader></sonner-loader>`
    div.innerHTML = `<div style="display: flex; align-items: center; gap: 4px;" class="loading">${url}${spinner}</div>`
    const id = showToast.success(div, { duration: 30_000 })

    promise.then(
      () => showToast.dismiss(id),
      () => {
        showToast.dismiss(id)
        showToast.error(url)
      },
    )

    return promise
  }
}

/**
 *
 * @param {'light' | 'dark'} [theme]
 * @returns {ToastFunction}
 */
export function init(theme) {
  window.addEventListener("DOMContentLoaded", () => {
    boot({
      theme,
      viewportOffset: 12,
      // theme: theme === "light" ? "dark" : "light",
      xPosition: "left",
      yPosition: "top",
      maxToasts: 10,

      expandedByDefault: false,
      // gap: -12,
      // closeButton: true,
      richColors: true,
    })

    const toastElement = /** @type {HTMLDivElement} */ (document.querySelector("ol[data-sourdough-toaster]"))
    toastElement.style.setProperty("--width", "max-content")
    toastElement.style.setProperty("--padding", "1px 6px")
    toastElement.style.setProperty("--border-radius", "4px")

    // @ts-expect-error
    settings.addEventListener("theme-change", (/** @type {CustomEvent<{ theme: string }>} */ e) => {
      const theme = e.detail.theme
      console.log("当前主题:", theme)
      toastElement.dataset.theme = theme
    })
  })

  patchFetch()

  return showToast
}

// Examples:
// const toast = init("light")

// setTimeout(() => {
//   toast("http://127.0.0.1:1123/?username=legend80s&limit=3http://127.0.0.1:1123/?username=legend80s&limit=3", {
//     duration: 30000_000,
//   })
// toast.success("It worked")
// toast.info("FYI")
// toast.warning("Careful")
// toast.error("It broke")
// toast.message({ title: "Saved", description: "Your changes are safe." })
// }, 1000)
