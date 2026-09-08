import { fileURLToPath } from "node:url"

import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { Hono } from "hono"
import { cors } from "hono/cors"

// import { cache } from "hono/cache"
// import { logger } from "hono/logger"

// import { cache } from "@hono/node-server/cache" // 注意这个导入路径

import { logger } from "./middlewares/fancy-logger.js"
import { serveMultipleStaticFolders } from "./middlewares/serve-mutiple-static-folders.js"
import { github, githubPath } from "./routes/github.js"
import { npmApi, npmApiPath } from "./routes/npm-api.js"
import { npmRegistry, npmRegistryPath } from "./routes/npm-registry.js"

const app = new Hono()

const faviconPath = fileURLToPath(new URL("../../frontend/closed-npm.svg", import.meta.url))

app.use("/favicon.ico", serveStatic({ path: faviconPath }))
// app.use("/frontend/closed-npm.svg", serveStatic({ path: faviconPath }))

function cacheAllPath() {
  app.use("*", async (c, next) => {
    // serve remote api then cache  to avoid 429 error
    // 浏览器缓存，不走服务端
    c.header("Cache-Control", "max-age=3600")

    await next()
  })

  app.route(githubPath, github).route(npmApiPath, npmApi).route(npmRegistryPath, npmRegistry)
}

app.use(logger())
app.use("/*", cors())

// global.caches not available in nodejs
// app.get(
//   "*",
//   cache({
//     cacheName: "my-app",
//     cacheControl: "max-age=3600",
//     wait: true,
//   }),
// )

// Serve the OpenAPI document
// Use the middleware to serve Swagger UI at /ui

/**
 *
 * @param {{ port: number, debug: typeof console.log }} param0
 * @returns { Promise<{ server: import('@hono/node-server').ServerType, info: import('node:net').AddressInfo }> }
 */
export function startServer({ port, debug }) {
  const { resolve, reject, promise } = Promise.withResolvers()
  // 自定义中间件：按顺序查找文件，hono 无法做到
  // Should not cache static files otherwise the browser will not get the latest html/css/js in development stage.
  // So the serveMultipleStaticFolders should placed before cacheAPI
  app.use("/*", serveMultipleStaticFolders(debug))
  // Only cache API requests to avoid 429 error
  cacheAllPath()

  const server = serve({ fetch: app.fetch, port }, (info) => {
    resolve({ server, info })
  })

  return promise
}

if (import.meta.main) {
  cacheAllPath()
  startServer({ port: 8848, debug: console.log })
}
