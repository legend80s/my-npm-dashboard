// serve remote api then store in local file to avoid 429 error

// if no local file, fetch from remote api and store in local file
import { serve } from "@hono/node-server"
import { Hono } from "hono"
// import { cache } from "hono/cache"
import { logger } from "hono/logger"
import { cors } from "hono/cors"

// import { cache } from "@hono/node-server/cache" // 注意这个导入路径

import { github, githubPath } from "./routes/github.js"
import { npmApi, npmApiPath } from "./routes/npm-api.js"
import { npmRegistry, npmRegistryPath } from "./routes/npm-registry.js"

const app = new Hono()

app.use("*", async (c, next) => {
  // 浏览器缓存，不走服务端
  c.header("Cache-Control", "max-age=3600")

  await next()
})

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

app
  .route(githubPath, github)
  .route(npmApiPath, npmApi)
  .route(npmRegistryPath, npmRegistry)

// Serve the OpenAPI document
// Use the middleware to serve Swagger UI at /ui

serve({ fetch: app.fetch, port: 8787 }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`, info)
})
