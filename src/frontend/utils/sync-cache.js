import { LocalStorage } from "./local-storage.js"

const localStorage = new LocalStorage()

const DEFAULT_THEME = "dark"

// Function to get the user's preferred color scheme
// Grabs from local storage if available or falls back to system preference
function getPreferredScheme() {
  const saved = localStorage.get("theme")

  const theme = saved === "light" || saved === "dark" ? saved : DEFAULT_THEME

  return theme
}

// Apply the preferred color scheme on load
applyScheme(getPreferredScheme())

// Listen for changes in system preference
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
  // If nothing in local storage, update accordingly
  const savedMode = localStorage.get("theme")
  if (!savedMode) {
    applyScheme(event.matches ? "dark" : "light")
  }
})

// Listen for clicks on the color scheme button
const settings = /** @type {HTMLElement} */ (document.getElementById("settings"))
settings.addEventListener("theme-change", (e) => {
  // document.getElementById("color-scheme-button")?.addEventListener("click", () => {
  const toDark = !document.documentElement.classList.contains("wa-dark")
  applyScheme(toDark ? "dark" : "light")
  localStorage.save("theme", toDark ? "dark" : "light")
})

/**
 * Function to apply color scheme
 * @param {import('../index.type.js').Theme} theme
 */
function applyScheme(theme) {
  document.documentElement.setAttribute("data-theme", theme)
  document.documentElement.classList.add(theme)
  document.documentElement.classList.toggle("wa-dark", theme === "dark")
}

// npmx or npm? default is npm
const savedProvider = localStorage.get("provider")
const provider = savedProvider === "npmx" || savedProvider === "npm" ? savedProvider : "npm"
document.documentElement.setAttribute("data-provider", provider)
