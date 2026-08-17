const saved = localStorage.getItem("theme")
const theme =
  saved === "light" || saved === "dark"
    ? saved
    : window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark"
document.documentElement.setAttribute("data-theme", theme)

const savedProvider = localStorage.getItem("provider")
const provider = savedProvider === "npmx" || savedProvider === "npm" ? savedProvider : "npm"
document.documentElement.setAttribute("data-provider", provider)
