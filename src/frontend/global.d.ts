import type { Theme } from "./index.type.ts"

// export {} // 确保这是一个模块

declare global {
  interface HTMLElementEventMap {
    "chart-provider-change": CustomEvent<{ provider: "npmx" | "chart.js" }>

    "theme-change": CustomEvent<{ theme: Theme }>
  }

  interface Window {
    originalFetch: typeof fetch
  }
}
// add originalFetch type to window
