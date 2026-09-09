import { $$, onChildChange } from "./light-jquery.js"
import { getLocale, t } from "./locales.js"

// Find and translate all the `[data-i18n-text]` element in DOM.
// let start = Date.now()

/**
 *
 * @param {string} i18nKey
 */
const compileLocales = (i18nKey) => {
  const toTranslateSelector = `[${i18nKey}]:not([data-i18n-translated])`
  const elements = $$(toTranslateSelector)
  // and all the shadowRoot
  const customElements = Array.from($$("settings-dialog"), (el) =>
    // @ts-expect-error
    Array.from(el.shadowRoot.querySelectorAll(toTranslateSelector)),
  )
    .filter((xs) => xs.length > 0)
    .flat(Infinity)
  // console.log("elements:", elements)
  // console.log("customElements:", customElements)
  const nodes = [...elements, ...customElements]
  // console.log("nodes:", nodes)

  // console.log(`compileLocales: found ${nodes.length} elements with ${i18nKey}`, "gap:", Date.now() - start, "ms")
  // start = Date.now()

  // const all = [...elements, ...customElements]

  nodes.forEach((element) => {
    // @ts-expect-error
    const key = element.getAttribute(i18nKey)
    // mark as translated to avoid re-translation
    // @ts-expect-error
    element.setAttribute("data-i18n-translated", "true")

    const translation = t(key)
    // console.log(`compileLocales: "${key}" → "${translation}"`)

    const pos = i18nKey.split("-").at(-1)
    if (pos === "title") {
      // @ts-expect-error
      element.title = translation
    } else {
      // @ts-expect-error
      element.textContent = translation
    }
  })
}

function compile() {
  const identities = ["data-i18n-text", "data-i18n-title"]

  identities.forEach((identity) => {
    compileLocales(identity)
  })
}

compile()

onChildChange(compile, { debounceTime: 100 })

document.documentElement.lang = getLocale()
