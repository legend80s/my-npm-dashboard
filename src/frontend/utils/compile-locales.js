import { $$, onChildChange } from "./light-jquery.js"
import { getLocale, t } from "./locales.js"

// Find and translate all the `[data-i18n-text]` element in DOM.
const operations = /** @type {const} */ (["text", "title", "html"])
const identities = operations.map((op) => /** @type {`data-i18n-${Operation}`} */ (`data-i18n-${op}`))

/** @typedef {typeof operations[number]} Operation */
/** @typedef {`data-i18n-${Operation}`} Identity */

// let start = Date.now()

/**
 *
 * @param {Identity} i18nKey
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
  // @ts-expect-error
  const nodes = /** @type {NodeListOf<HTMLElement>} */ ([...elements, ...customElements])
  // console.log("nodes:", nodes)

  // console.log(`compileLocales: found ${nodes.length} elements with ${i18nKey}`, "gap:", Date.now() - start, "ms")
  // start = Date.now()

  // const all = [...elements, ...customElements]

  nodes.forEach((element) => {
    const key = element.getAttribute(i18nKey)
    // mark as translated to avoid re-translation
    element.setAttribute("data-i18n-translated", "true")

    // @ts-expect-error
    const translation = t(key)
    // console.log(`compileLocales: "${key}" → "${translation}"`)

    const pos = /** @type {Operation} */ (i18nKey.split("-").at(-1))

    switch (pos) {
      case "title":
        element.title = translation
        break
      case "text":
        element.textContent = translation
        break
      case "html":
        element.innerHTML = translation
        break
      default: {
        // for Exhaustive Checking. If this line have type error, it indicates uncovered branches.
        assertNever(pos)
      }
    }
  })
}

/** @param {never} x  */
function assertNever(x) {
  throw new Error(`Unexpected value: ${x}`)
}

function compile() {
  identities.forEach((identity) => {
    compileLocales(identity)
  })
}

compile()

onChildChange(compile, { debounceTime: 100 })

document.documentElement.lang = getLocale()
