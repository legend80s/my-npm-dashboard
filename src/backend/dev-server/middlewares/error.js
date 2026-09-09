import { HTTPException } from "hono/http-exception"

// 全局错误处理中间件
/**
 *
 * @type {import('hono/types').ErrorHandler}
 */
export function onApiError(err, c) {
  console.error("[onApiError]", err)

  // 处理 HTTPException（可以携带状态码）
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        message: err.message,
        status: err.status,
      },
      err.status,
    )
  }

  // 处理其他错误（500）
  return c.json(
    {
      success: false,
      message: err.message || "Internal Server Error",
      status: 500,
    },
    500,
  )
}
