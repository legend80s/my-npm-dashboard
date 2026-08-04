/**
 *
 * @param {string} templatePath
 * @returns {Promise<string>}
 */
export async function loadHTML(templatePath) {
  const response = await fetch(templatePath)
  const template = await response.text()

  return template
}
