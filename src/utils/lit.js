/**
 * Nothing special, just a simple template literal tag function to help with syntax highlighting in editors.
 * And https://lit.dev/docs/tools/development/#lit-plugin should installed for syntax highlighting.
 * @param {TemplateStringsArray} strings
 * @returns {string}
 */
export function html(strings) {
  const htmlString = /** @type {string} */ (strings.raw[0])

  return htmlString
}

// /**
//  * @template {string} T
//  * @param {T} htmlString
//  * @returns {T}
//  */
// export function html(htmlString) {
//   return htmlString
// }
