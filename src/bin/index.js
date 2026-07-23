#!/usr/bin/env node

import { join } from "node:path"
import { startServer } from "../server/index.js"

const PORT = process.env.PORT || 3000
// const rootDir = new URL("..", import.meta.url).pathname

startServer({
  port: PORT,
  root: join(import.meta.dirname, "../"),
  open: false, // 自动打开浏览器
})
