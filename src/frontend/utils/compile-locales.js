import { t } from "./locales.js"

// Find and translate all the `[data-i18n-key]` element in DOM.
export const compileLocales = () => {
  const elements = document.querySelectorAll("[data-i18n-key]")
  elements.forEach((element) => {
    const key = element.getAttribute("data-i18n-key")

    // @ts-expect-error
    const translation = t(key)
    element.textContent = translation
  })
}
