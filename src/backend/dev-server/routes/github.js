import { Hono } from "hono"
import { fetchJSON, RED, RESET, YELLOW } from "../../../shared/utils/light-lodash.js"
import { MyURL } from "./_utils.js"

const host = "https://api.github.com"
const debugging = false

export const github = new Hono()
export const githubPath = `/${host}`

// [API]   [fetchJSON] github repo https://api.github.com/repos/quansync-dev/quansync
// [API] TypeError: fetch failed
// [API]     at node:internal/deps/undici/undici:13510:13
// [API]     code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'

// add NODE_TLS_REJECT_UNAUTHORIZED=0 to env to disable ssl verification
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

// empty string -> no proxy
const proxies = new Set([
  "",
  process.env.GITHUB_PROXY || "",
  "https://gh-proxy.org/",
  "https://v4.gh-proxy.org/",
  "https://v6.gh-proxy.org/",
  "https://cdn.gh-proxy.org/",
])
  .values()
  .toArray()

github.get("/repos/:owner/:repo", async (c) => {
  // fetch https://api.github.com/repos/legend80s/pocket
  const owner = c.req.param("owner")
  const repo = c.req.param("repo")

  const url = `${host}/repos/${owner}/${repo}`

  const json = await fetchUsingProxy(url, {
    label: "github repo",
    verbose: true,
  })

  return c.json(json)
})

// const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=1`
github.get("/repos/:owner/:repo/commits", async (c) => {
  // fetch https://api.github.com/repos/legend80s/pocket/commits?per_page=1
  const owner = c.req.param("owner")
  const repo = c.req.param("repo")

  const url = `${host}/repos/${owner}/${repo}/commits?per_page=1`

  const json = await fetchUsingProxy(url, {
    label: "github commits",
    verbose: true,
  })

  return c.json(json)
})

// https://api.github.com/repositories/430023490/commits?page=4
github.get("/repositories/:id/commits", async (c) => {
  const id = c.req.param("id")
  const allQuery = c.req.query()

  const url = new MyURL(`${host}/repositories/${id}/commits`, allQuery)

  const json = await fetchUsingProxy(url.toString(), {
    label: "github id commits",
    verbose: true,
  })

  return c.json(json)
})

/**
 * Roust github API using a proxies.
 * @type {typeof fetchJSON}
 */
async function fetchUsingProxy(url, opt) {
  let json
  let currentUrl = ""
  let lastError = null

  proxies.sort(() => (Math.random() > 0.5 ? -1 : 1)) // shuffle proxies for load balancing

  for (const proxy of proxies) {
    currentUrl = `${proxy}${url}`

    try {
      json = await fetchJSON(currentUrl, opt)
    } catch (fetchGithubRepoError) {
      lastError = fetchGithubRepoError
      debugging && console.warn(YELLOW, "WARN", `"${currentUrl}"`, fetchGithubRepoError, RESET)
    }
  }

  if (!json) {
    if (!lastError) {
      const msg = `[fetchUsingProxy] nil lastError (IMPOSSIBLE). Could not fetch "${url}" using any of the proxies`
      console.error(RED, msg, RESET)
      throw new Error(msg)
    }

    throw lastError
  }

  return json
}
