type ToastId = string
type Text = string | HTMLElement

type PerToastOptions = {
  duration: number
}

type ToastMessageOptions = PerToastOptions & {
  title?: string
  /** Smaller text below the title */
  description?: Text
}

// 主要 toast 函数类型
export interface ToastFunction {
  /** 显示普通 toast */
  (message: Text, opts?: PerToastOptions): ToastId
  /** 显示带标题和描述的 toast */
  // (options: ToastMessageOptions): ToastId

  /** 成功提示 */
  success: (message: Text, opts?: PerToastOptions) => ToastId
  /** 信息提示 */
  info: (message: Text, opts?: PerToastOptions) => ToastId
  /** 警告提示 */
  warning: (message: Text, opts?: PerToastOptions) => ToastId
  /** 错误提示 */
  error: (message: Text, opts?: PerToastOptions) => ToastId
  /** 带标题和描述的消息提示 */
  message: (options: ToastMessageOptions) => ToastId

  /** 手动关闭特定 toast */
  dismiss: (id: string) => ToastId
}

export interface IPatchFetch {
  (): void
  done: boolean
}

// const foo: IPatchFetch = () => { return 1 }
// foo.done = false
// const xx = foo()
