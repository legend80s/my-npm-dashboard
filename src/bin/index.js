#!/usr/bin/env node

import { startServer } from "../server/index.js"

const PORT = process.env.PORT || 3000
const rootDir = new URL("..", import.meta.url).pathname

startServer({
  port: PORT,
  root: rootDir,
  open: true, // 自动打开浏览器
})
