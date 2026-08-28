// class="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-0.5 sm:p-1"

import { html } from "../../utils/lit.js"

window.customElements.define(
  "copyright-footer",
  class extends HTMLElement {
    constructor() {
      super()
      this.attachShadow({ mode: "open" }).innerHTML = this.template()
    }
    template() {
      const curYear = new Date().getFullYear()
      return html`
        <style>
          /* ===== Reset & Base ===== */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          .text-muted {
            color: var(--text-muted);
          }
          .mt-1 {
            margin-top: 0.25rem;
          }
          
          footer {
            text-align: center;
          }
        </style>

        <footer>
        Every big project starts as a calf. Tend your whole npm herd, sorted by
        birth date.
        <p>A npm dashboard for your recently "born" packages</p>
        <p class="text-muted mt-1">
          Copyright © 2026-${curYear || "present"} @legend80s.com. All Rights Reserved.
        </p>
      </footer>`
    }
  },
)
