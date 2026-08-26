/**
 * Nothing special, just a simple template literal tag function to help with syntax highlighting in editors.
 * And https://lit.dev/docs/tools/development/#lit-plugin should installed for syntax highlighting.
 * @param {TemplateStringsArray} strings
 * @param {unknown[]} values
 * @returns {string}
 */
export function html(strings, ...values) {
  // const htmlString = /** @type {string} */ (strings.raw[0])

  // return htmlString
  return String.raw({ raw: strings }, ...values)
}
