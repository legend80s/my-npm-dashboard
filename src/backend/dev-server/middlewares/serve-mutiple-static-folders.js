import { existsSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { serveStatic } from "@hono/node-server/serve-static"

// 先匹配 frontend 目录
// app.use("/*", serveStatic({ root: fileURLToPath(new URL("../../frontend", import.meta.url)) }))
// 如果 frontend 没有找到，再尝试 shared 目录
// app.use("/xx/*", serveStatic({ root: fileURLToPath(new URL("../../shared", import.meta.url)) }))

// 自定义中间件：按顺序查找文件
/**
 *
 * @return {Parameters<import('hono').Hono['use']>[1]}
 */
export const serveMultipleStaticFolders =
  (debug = console.log) =>
  async (c, next) => {
    const path = c.req.path
    debug("path:", path)

    // 尝试的目录顺序
    const roots = ["../../../frontend", "../../../shared"]
    // [frontend, shared]
    const parts = ["/", ...roots.map((root) => `/${root.split("/").at(-1)}/`)].map(
      // biome-ignore lint/complexity/noUselessStringRaw: <explanation>
      (part) => new RegExp(String.raw`^${part}`),
    )

    debug("  parts:", parts)

    for (let root of roots) {
      root = fileURLToPath(new URL(root, import.meta.url))

      // root = resolve(root, import.meta.url)
      debug("  search in root:", root)
      for (const part of parts) {
        // trim prefix /shared/ and retry
        const trimmedPath = path.replace(part, "")
        debug(`    trimmedPath: |${trimmedPath}|`)
        const filePath = resolve(root, trimmedPath)
        debug("    filePath:", filePath)
        if (existsSync(filePath)) {
          // 使用 serveStatic 处理找到的文件
          const handler = serveStatic({ root, path: trimmedPath })
          return handler(c, next)
        }
      }
      // const trimmedPath = path.slice(1) // 去掉开头的 /
      // const filePath = resolve(root, trimmedPath) // 去掉开头的 /
      // console.log("filePath:", filePath)
      // if (existsSync(filePath)) {
      //   // 使用 serveStatic 处理找到的文件
      //   const handler = serveStatic({ root, path: trimmedPath })
      //   return handler(c, next)
      // } else {
      //   // trim prefix /shared/ and retry
      //   const trimmedPath = path.replace(/^\/shared\//, "")
      //   const filePath = resolve(root, trimmedPath)
      //   console.log("    filePath:", filePath)
      //   if (existsSync(filePath)) {
      //     // 使用 serveStatic 处理找到的文件
      //     const handler = serveStatic({ root, path: trimmedPath })
      //     return handler(c, next)
      //   }
      // }
    }

    // 都没找到，继续下一个中间件
    debug("  no file found")
    await next()
  }
