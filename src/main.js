// @ts-expect-error
const { invoke } = window.__TAURI__.core

// @ts-expect-error
let greetInputEl
// @ts-expect-error
let greetMsgEl

async function greet() {
  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  // @ts-expect-error
  greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value })
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input")
  greetMsgEl = document.querySelector("#greet-msg")
  // @ts-expect-error
  document.querySelector("#greet-form").addEventListener("submit", (e) => {
    e.preventDefault()
    greet()
  })
})
