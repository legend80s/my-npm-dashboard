/**
 * 跨平台打开浏览器
 * @param {string} url - 要打开的 URL
 * @returns {Promise<true | Error>} 是否成功打开
 */
export async function openBrowser(url, { debug = console.log } = {}) {
  const { spawnSync } = await import("node:child_process")
  const platform = process.platform
  let command
  let args

  // 根据操作系统选择命令
  if (platform === "win32") {
    // Windows: 使用 start 命令
    // command = "cmd"
    // args = ["/c", "start", "", url]
    command = "start"
    args = [url]
  } else if (platform === "darwin") {
    // macOS: 使用 open 命令
    command = "open"
    args = [url]
  } else {
    // Linux / Unix: 使用 xdg-open
    command = "xdg-open"
    args = [url]
  }

  debug?.("openBrowser", { platform, command, args })

  try {
    const _child = spawnSync(command, args, {
      // stdio: "ignore", // 忽略所有输出
      // detached: true, // 分离进程，允许父进程退出
      shell: platform === "win32", // Windows 需要 shell
    })

    // 解除父进程对子进程的引用，让子进程独立运行
    // child.unref()

    return true
  } catch (error) {
    // 静默失败，不抛出异常
    return /** @type {Error} */ (error)
  }
}
