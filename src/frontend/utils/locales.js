/**
 * i18n locale 数据 & 翻译函数
 */

/**
 *
 * @returns {boolean}
 */
function isChinese() {
  return false
  // return navigator.language.includes("zh")
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
}

// ── Select locale ─────────────────────────────────

/**
 * @returns {Record<string, string>}
 */
function getLocale() {
  return isChinese() ? zh : en
}

/**
 * 翻译函数
 * @param {string} key - 翻译 key，如 "add.result.header"
 * @param {Record<string, string | number | undefined>} [vars] - 插值变量，如 { name: "foo" }
 * @returns {string}
 */
export function t(key, vars = {}) {
  const lang = /** @type {Record<string, string>} */ (getLocale())
  let template = lang[key]
  if (template === undefined) {
    console.error(`Missing translation for key: ${key}`)
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
