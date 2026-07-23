import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join, extname } from "node:path"
import { spawn } from "node:child_process"

/**
 * MIME 类型映射
 */
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".wasm": "application/wasm",
}

/**
 * 获取 MIME 类型
 */
function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase()
  return MIME_TYPES[ext] || "application/octet-stream"
}

/**
 * 解析请求路径，防止目录遍历攻击
 */
function safePath(root, url) {
  // 去掉查询参数
  const pathname = url.split("?")[0]
  // 解码并规范化路径
  const decoded = decodeURIComponent(pathname)
  const normalized = join(root, decoded)
  // 检查是否在 root 目录内
  const resolved = join(root, pathname)
  if (!resolved.startsWith(root)) {
    return null
  }
  return normalized
}

/**
 * 打开浏览器
 */
function openBrowser(url) {
  const platform = process.platform
  let command
  let args

  if (platform === "win32") {
    command = "start"
    args = ['""', url]
  } else if (platform === "darwin") {
    command = "open"
    args = [url]
  } else {
    command = "xdg-open"
    args = [url]
  }

  try {
    const child = spawn(command, args, {
      stdio: "ignore",
      detached: true,
      shell: platform === "win32",
    })
    child.unref()
  } catch (_) {
    // 静默失败
  }
}

/**
 * 启动静态文件服务器
 */
export function startServer({ port, root, open = true }) {
  const server = createServer(async (req, res) => {
    try {
      // 解析请求路径
      const filePath = safePath(root, req.url)

      // 路径无效或不在 root 内
      if (!filePath) {
        res.statusCode = 403
        res.end("Forbidden")
        return
      }

      // 处理 404
      if (!existsSync(filePath)) {
        res.statusCode = 404
        res.setHeader("Content-Type", "text/html; charset=utf-8")
        res.end(`
                        <!DOCTYPE html>
                        <html>
                        <head><meta charset="UTF-8"><title>404</title></head>
                        <body>
                            <h1>404 - 文件未找到</h1>
                            <p>${req.url}</p>
                        </body>
                        </html>
                    `)
        return
      }

      // 读取文件
      const content = await readFile(filePath)

      // 设置 MIME 类型
      const mimeType = getMimeType(filePath)
      res.setHeader("Content-Type", mimeType)

      // 对 HTML 文件禁用缓存（开发友好）
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
        res.setHeader("Pragma", "no-cache")
        res.setHeader("Expires", "0")
      }

      res.statusCode = 200
      res.end(content)
    } catch (err) {
      console.error("[Server Error]", err)
      res.statusCode = 500
      res.setHeader("Content-Type", "text/plain; charset=utf-8")
      res.end("Internal Server Error")
    }
  })

  server.listen(port, () => {
    const url = `http://localhost:${port}`
    console.log(`
                🐿️  pkg-marmot
                📡 服务器已启动: ${url}
                📂 根目录: ${root}
                ℹ️  按 Ctrl+C 停止服务器
            `)

    if (open) {
      openBrowser(url)
    }
  })

  // 优雅关闭
  process.on("SIGINT", () => {
    console.log("\n🛑 服务器已关闭")
    server.close(() => process.exit(0))
  })

  return server
}
