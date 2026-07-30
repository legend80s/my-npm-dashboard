import { Hono } from "hono"
import { fetchJSON } from "../../../utils/light-lodash.js"

const npmHost = "https://registry.npmjs.org"

export const npmRegistry = new Hono()
export const npmRegistryPath = `/${npmHost}`

npmRegistry.get("/:package", async (c) => {
  // fetch https://registry.npmjs.org/:package
  const name = c.req.param("package")

  const json = await fetchJSON(`${npmHost}/${name}`, {
    label: "fetch npm package",
    verbose: true,
  })

  // const json = {
  //   name,

  //   timestamp: Date.now(),
  // }

  return c.json(json)
})

// https://registry.npmjs.org/-/v1/search?text=maintainer:legend80s
npmRegistry.get("/-/v1/search", async (c) => {
  // fetch https://registry.npmjs.org/-/v1/search?text=maintainer:legend80s
  const allQuery = c.req.query()

  // 透传所有参数到上游
  const url = new URL(`${npmHost}/-/v1/search`)
  Object.entries(allQuery).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  // console.log("url:", url)

  const json = await fetchJSON(url.toString(), {
    label: "npm search",
    verbose: true,
  })

  return c.json(json)
})
