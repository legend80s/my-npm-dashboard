// type ToastOptions = {}
type ToastMessageOptions = {
  title: string
  /** Smaller text below the title */
  description?: string
}

// 主要 toast 函数类型
export interface ToastFunction {
  /** 显示普通 toast */
  (message: string): void
  /** 显示带标题和描述的 toast */
  // (options: ToastMessageOptions): void

  /** 成功提示 */
  success: (message: string) => void
  /** 信息提示 */
  info: (message: string) => void
  /** 警告提示 */
  warning: (message: string) => void
  /** 错误提示 */
  error: (message: string) => void
  /** 带标题和描述的消息提示 */
  message: (options: ToastMessageOptions) => void

  // /** 手动关闭所有 toast */
  // dismissAll?: () => void
  // /** 手动关闭特定 toast */
  // dismiss?: (id: string | number) => void
}
