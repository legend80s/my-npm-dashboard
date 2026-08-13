#!/usr/bin/env node

// import { join } from "node:path"
import { startServer } from "../backend/dev-server/index.js"

const PORT = process.env.PORT
// const rootDir = new URL("..", import.meta.url).pathname
const DEFAULT_PORT = 1123

startServer({
  port: PORT ? Number(PORT) : DEFAULT_PORT,
  // root: join(import.meta.dirname, "../"),
  // open: false, // 自动打开浏览器
})
