// @ts-expect-error
import { boot, toast as showToast } from "sourdough-toast"

/**
 *
 * @param {'light' | 'dark'} [theme]
 * @returns {import('./sonner.type.js').ToastFunction}
 */
export function init(theme) {
  window.addEventListener("DOMContentLoaded", () =>
    boot({
      theme,
      viewportOffset: 16,
      // theme: theme === "light" ? "dark" : "light",
      xPosition: "left",
      yPosition: "top",
      maxToasts: 10,
      expandedByDefault: true,
      gap: -12,
      closeButton: true,
      richColors: true,
    }),
  )

  return showToast
}

// Examples:
// const toast = init("light")

// setTimeout(() => {
//   toast("Plain toast")
//   toast.success("It worked")
//   toast.info("FYI")
//   toast.warning("Careful")
//   toast.error("It broke")
//   toast.message({ title: "Saved", description: "Your changes are safe." })
// }, 1000)
