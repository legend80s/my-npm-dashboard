import { Hono } from "hono"
// TODO: pnpm monorepo
import { fetchJSON } from "../../../shared/utils/light-lodash.js"

const npmApiHost = "https://api.npmjs.org"
export const npmApi = new Hono()
export const npmApiPath = `/${npmApiHost}`

// const url = `https://api.npmjs.org/downloads/range/${period}/${pkgName}`
npmApi.get("/downloads/range/:period/:package", async (c) => {
  // fetch https://api.npmjs.org/downloads/range/last-month/:package
  const period = c.req.param("period")
  const pkgName = c.req.param("package")

  const url = `${npmApiHost}/downloads/range/${period}/${pkgName}`

  const json = await fetchJSON(url, {
    label: "npm downloads",
    verbose: true,
  })

  return c.json(json)
})
