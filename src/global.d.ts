declare global {
  interface HTMLElementEventMap {
    "chart-provider-change": CustomEvent<{ provider: number }>
  }
}
