import { existsSync } from "node:fs"
import { resolve } from "node:path"
import { serveStatic } from "@hono/node-server/serve-static"

// 先匹配 frontend 目录
// app.use("/*", serveStatic({ root: fileURLToPath(new URL("../../frontend", import.meta.url)) }))
// 如果 frontend 没有找到，再尝试 shared 目录
// app.use("/xx/*", serveStatic({ root: fileURLToPath(new URL("../../shared", import.meta.url)) }))

// 自定义中间件：按顺序查找文件
/**
 *
 * @type {Parameters<import('hono').Hono['use']>[1]}
 */
export const serveMultipleStaticFolders = async (c, next) => {
  const path = c.req.path

  // 尝试的目录顺序
  const roots = ["./src/frontend", "./src/shared"]
  // [frontend, shared]
  const parts = ["/", ...roots.map((root) => `/${root.split("/").at(-1)}/`)].map(
    // biome-ignore lint/complexity/noUselessStringRaw: <explanation>
    (part) => new RegExp(String.raw`^${part}`),
  )

  // console.log("parts:", parts)

  for (const root of roots) {
    // console.log("\n\nsearch in root:", root)
    for (const part of parts) {
      // trim prefix /shared/ and retry
      // console.log("path:", path)
      const trimmedPath = path.replace(part, "")
      // console.log("trimmedPath:", trimmedPath)
      const filePath = resolve(root, trimmedPath)
      // console.log("    filePath:", filePath)
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
  await next()
}
