/**
 * i18n locale 数据 & 翻译函数
 */

/**
 *
 * @returns {boolean}
 */
export function isChinese() {
  // return false
  return getLocale().includes("zh")
}

export function getLocale() {
  // return "en-US"
  // return "zh-CN"
  return navigator.language
}

// ── 中文 ──────────────────────────────────────────

const zh = {
  // index.js
  "help.text": `\

> 🐦 Pelican - 从鹈鹕鼓鼓囊囊的喉囊中掏出你的专属命令行工具

## 用法:
  pelican catch <alias...>    安装一个或多个 alias
  pelican list                列出所有 alias
  pelican --version, -v       显示版本号
  pelican --help, -h          显示帮助信息
  pelican --verbose           显示详细信息

## 示例:
  pelican catch                               交互式选择安装
  pelican catch <fish_name1>                  安装一个
  pelican catch <fish_name1> <fish_name2> ... 批量安装

## 文档:
  https://github.com/legend80s/pocket`,
  "version.label": "pelican v{version}",
  "error.generic": "❌ 发生错误: {message}",

  // add.js
  "add.error.shell_detect": "❌ 无法检测 Shell 类型，请确保使用 zsh 或 bash",
  "add.error.no_rc_file": "❌ 无法获取 Shell 配置文件路径",
  "add.error.no_templates": "❌ 没有可用的 alias 模板",
  "add.error.rc_not_found.path": "❌ 未找到配置文件: {path}",
  "add.error.rc_not_found.create": "请先创建 {path} 文件",
  "add.error.template_not_found": "❌ 未找到模板: {name}",
  "add.error.template_not_exist": "模板不存在",

  "add.prompt.select_aliases": "选择要安装的 alias（空格选择，回车确认）",
  "add.prompt.confirm_overwrite": "\n⚠️  {name} 已安装，是否覆盖？",

  "add.log.no_selection": "未选择任何 alias，退出",
  "add.log.changes_header": "\n📋 {name} 变更：",
  "add.log.no_diff": "\n📋 {name}: 无差异",

  "add.result.header": "\n## 📦 安装结果\n",
  "add.result.failed": "  ❌ {name}: 失败 - {error}",
  "add.result.skipped": "{name}: 已跳过",
  "add.result.updated": "已更新",
  "add.result.added": "已安装",
  "add.result.usage_label": "用法: {usage}",
  "add.result.written_to": "✅ 已写入到 {path}",
  "add.result.sourced_to": "📝 已追加 source 到 {path}",
  "add.result.restart_terminal": "重启终端以生效",

  // list.js
  "list.error.no_templates": "📭 没有可用的 alias 模板",
  "list.status.installed": "✅ 已安装",
  "list.status.not_installed": "⬜ 未安装",
  "list.footer.path": "📁 安装路径: {path}",

  // template.js
  "template.error.no_description": "模板 {name} 没有描述信息",

  // 最近在忙着开发什么？
  recently: "最近在忙着开发什么？",
  "hottestTrend.none": "近期无下载量攀升的包",
  no: "（无）",
  slogan1: "每个大项目都始于一只初生牛犊。按「分娩」日期管理你的整个 npm 牧群",
  slogan2: "一个为你最近「诞生」的包而设计的 npm 仪表盘",
}

// ── English ───────────────────────────────────────

const en = {
  "help.text": `\

> 🐦 Pelican - Pull your CLI tools from your pelican' pouch

## Usage:
  pelican catch <alias...>    Install one or more aliases
  pelican list                List all aliases
  pelican --version, -v       Show version
  pelican --help, -h          Show help
  pelican --verbose           Show verbose output

## Examples:
  pelican catch                               Interactive selection
  pelican catch <alias_name>                  Install a single alias
  pelican catch <alias_name1> <alias_name2>   Install multiple aliases

## Docs:
  https://github.com/legend80s/pocket`,
  "version.label": "pelican v{version}",
  "error.generic": "❌ Error: {message}",

  "add.error.shell_detect": "❌ Cannot detect shell type. Please use zsh or bash",
  "add.error.no_rc_file": "❌ Cannot get shell config file path",
  "add.error.no_templates": "❌ No available alias templates",
  "add.error.rc_not_found.path": "❌ Config file not found: {path}",
  "add.error.rc_not_found.create": "Please create {path} first",
  "add.error.template_not_found": "❌ Template not found: {name}",
  "add.error.template_not_exist": "Template does not exist",
  "add.prompt.select_aliases": "Select alias to install (space to select, enter to confirm)",
  "add.prompt.confirm_overwrite": "\n⚠️  {name} already installed. Overwrite?",
  "add.log.no_selection": "No alias selected. Exiting.",
  "add.log.changes_header": "\n📋 {name} changes:",
  "add.log.no_diff": "\n📋 {name}: no differences",
  "add.result.header": "\n## 📦 Installation results\n",
  "add.result.failed": "  ❌ {name}: failed - {error}",
  "add.result.skipped": "{name}: skipped",
  "add.result.updated": "updated",
  "add.result.added": "installed",
  "add.result.usage_label": "Usage: {usage}",
  "add.result.written_to": "✅ Written to {path}",
  "add.result.sourced_to": "📝 Source line appended to {path}",
  "add.result.restart_terminal": "Restart terminal to take effect",

  "list.error.no_templates": "📭 No available alias templates",
  "list.status.installed": "✅ Installed",
  "list.status.not_installed": "⬜ Not installed",
  "list.footer.path": "📁 Install path: {path}",

  "template.error.no_description": "Template {name} does not have a description",

  recently: "What are you building these days?",
  // 近期无下载量攀升的包
  "hottestTrend.none": "No recent download spikes.",
  no: "（none）",
  发布: "Publish",
  诞生于: "Born",
  "npm 搜索包数量上限": "Limit to search in npm registry",
  刷新: "Refresh",
  "强制刷新数据（忽略缓存）": "Force refresh data (ignore cache)",
  无缓存: "No cache",
  已过期: "Expired",
  缓存数据: "Cache data",
  实时数据: "Real-time data",
  剩余: "Remaining",
  小时: "hours",
  分钟: "minutes",
  数据来自: "Data from",
  slogan1: "Every big project starts as a calf. Tend your whole npm herd, sorted by birth date.",
  slogan2: `A npm dashboard for your recently "born" packages`,
  "如果你近期发布的包不在其内，可尝试增大该值": "Don't see your latest packages? try increasing this value",
  "📊 前往洞察页面": "📊 Go to Insight page",
  "势头最猛：当前增速最快包": "Hottest Trend: packages with the highest growth rate right now",
  最近七天下载量: "Last 7 Days Downloads",
}

// ── Select locale ─────────────────────────────────

const locale = isChinese() ? zh : en

/**
 * 翻译函数
 * @param {keyof (typeof en & typeof zh)} key - 翻译 key，如 "add.result.header"
 * @param {Record<string, string | number | undefined>} [vars] - 插值变量，如 { name: "foo" }
 * @returns {string}
 */
export function t(key, vars = {}) {
  // @ts-expect-error
  let template = locale[key]
  if (template === undefined) {
    // 中文可以当做 key 直接返回，英文则提示缺失翻译
    ;/^[a-zA-Z]+$/.test(key) && console.error(`Missing translation for key: ${key}`)

    return key
  }

  if (!vars) {
    return template
  }

  for (const [k, v] of Object.entries(vars)) {
    template = template.replaceAll(`{${k}}`, String(v ?? ""))
  }
  return template
}
