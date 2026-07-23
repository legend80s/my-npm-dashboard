import { spawn } from "node:child_process"
import { existsSync, statSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { createServer } from "node:http"
import { extname, join, normalize, sep } from "node:path"

const debugging = false

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

function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase()
  return MIME_TYPES[ext] || "application/octet-stream"
}

/**
 * 安全解析路径，防止目录遍历攻击
 * 修复 Windows 路径问题
 */
function safePath(root, url) {
  // 去掉查询参数
  const pathname = url.split("?")[0] || "/"

  // 解码 URL
  const decoded = decodeURIComponent(pathname)

  // 将 URL 路径转换为文件系统路径
  // 注意：在 Windows 下，/ 转换为 \
  const relativePath = decoded.replace(/\//g, sep)

  // 如果是根路径，relativePath 可能是空字符串或 \
  const normalizedRelative =
    relativePath === sep || relativePath === "" ? "" : relativePath

  // 拼接完整路径
  let fullPath = join(root, normalizedRelative)

  // 规范化路径（处理 .. 等）
  fullPath = normalize(fullPath)

  // 检查是否在 root 目录内（使用 fs.realpath 或简单字符串比较）
  // 简单方法：确保 fullPath 以 root 开头（归一化后比较）
  const normalizedRoot = normalize(root)

  // 确保 root 以路径分隔符结尾，防止 "root" 匹配到 "root2"
  const rootWithSep = normalizedRoot.endsWith(sep)
    ? normalizedRoot
    : normalizedRoot + sep

  // 检查 fullPath 是否在 root 目录内
  if (!fullPath.startsWith(rootWithSep) && fullPath !== normalizedRoot) {
    // 额外检查：如果请求的是根目录本身，允许通过
    if (fullPath === normalizedRoot) {
      return fullPath
    }
    return null
  }

  return fullPath
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
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)

    try {
      // 解析请求路径
      const filePath = safePath(root, req.url)

      if (!filePath) {
        console.warn(`    [WARN] [403] 路径被拒绝: ${req.url}`)
        res.statusCode = 403
        res.setHeader("Content-Type", "text/plain; charset=utf-8")
        res.end("403 Forbidden - 路径不在允许范围内")
        return
      }

      debugging && console.log(`[File] 尝试访问: ${filePath}`)

      // 检查文件是否存在
      if (!existsSync(filePath)) {
        console.warn(`    [WARN] [404] 文件不存在: ${filePath}`)
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

      // 检查是否是目录
      const stats = statSync(filePath)
      if (stats.isDirectory()) {
        // 如果是目录，尝试返回 index.html
        const indexPath = join(filePath, "index.html")
        if (existsSync(indexPath)) {
          // 重定向到 / 或直接返回 index.html
          const content = await readFile(indexPath)
          res.setHeader("Content-Type", "text/html; charset=utf-8")
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
          res.statusCode = 200
          res.end(content)
          return
        }
        // 没有 index.html，返回目录列表（或 404）
        res.statusCode = 404
        res.setHeader("Content-Type", "text/html; charset=utf-8")
        res.end(`
                        <!DOCTYPE html>
                        <html>
                        <head><meta charset="UTF-8"><title>404</title></head>
                        <body>
                            <h1>404 - 没有 index.html</h1>
                            <p>目录: ${req.url}</p>
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
    const launchInfo = {
      "🐿️": "My npm Dashboard",
      "📡 服务器已启动": `${url}`,
      "📂 根目录": `${root}`,
      "": `按 Ctrl+C 停止服务器`,
    }

    console.table(launchInfo)
    console.log(`
        🐿️  My npm Dashboard

    📡 服务器已启动: ${url}
    📂 根目录: ${root}
    ℹ️  按 Ctrl+C 停止服务器
    `)

    if (open) {
      openBrowser(url)
    }
  })

  process.on("SIGINT", () => {
    console.log("\n🛑 服务器已关闭")
    server.close(() => process.exit(0))
  })

  return server
}
