// class="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-0.5 sm:p-1"

import { html } from "../../utils/lit.js"

window.customElements.define(
  "fancy-border",
  class extends HTMLElement {
    constructor() {
      super()
      this.attachShadow({ mode: "open" }).innerHTML = this.template()
    }
    template() {
      return html`
        <style>
          section {
            border: 1px solid red;
          }
        </style>
        <section>
          <slot></slot>
        </section>
      `
    }
  },
)
