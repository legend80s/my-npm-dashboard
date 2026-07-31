import { Hono } from "hono"
import { fetchJSON } from "../../../utils/light-lodash.js"

const host = "https://api.github.com"

export const github = new Hono()
export const githubPath = `/${host}`

// [API]   [fetchJSON] github repo https://api.github.com/repos/quansync-dev/quansync
// [API] TypeError: fetch failed
// [API]     at node:internal/deps/undici/undici:13510:13
// [API]     code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'

// add NODE_TLS_REJECT_UNAUTHORIZED=0 to env to disable ssl verification
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

github.get("/repos/:owner/:repo", async (c) => {
  // fetch https://api.github.com/repos/legend80s/marmot
  const owner = c.req.param("owner")
  const repo = c.req.param("repo")

  const url = `${host}/repos/${owner}/${repo}`

  const json = await fetchJSON(url, {
    label: "github repo",
    verbose: true,
  })

  return c.json(json)
})

// const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=1`
github.get("/repos/:owner/:repo/commits", async (c) => {
  // fetch https://api.github.com/repos/legend80s/marmot/commits?per_page=1
  const owner = c.req.param("owner")
  const repo = c.req.param("repo")

  const url = `${host}/repos/${owner}/${repo}/commits?per_page=1`

  const json = await fetchJSON(url, {
    label: "github commits",
    verbose: true,
  })

  return c.json(json)
})
