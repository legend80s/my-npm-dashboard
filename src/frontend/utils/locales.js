/**
 * i18n locale 数据 & 翻译函数
 */

/**
 * @returns {boolean}
 */
export function isChinese() {
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
  https://github.com/legend80s/my-npm-dashboard`,

  "add.error.shell_detect": "❌ 无法检测 Shell 类型，请确保使用 zsh 或 bash",

  // template.js
  "template.error.no_description": "模板 {name} 没有描述信息",

  // 最近在忙着开发什么？
  recently: "最近在忙着开发什么？",
  "hottestTrend.none": "近期无下载量攀升的包",
  no: "（无）",
  slogan1: "每个大项目都始于一只初生牛犊。按「分娩」日期管理你的整个 npm 牧群",
  slogan2: "一个为你最近「诞生」的包而设计的 npm 仪表盘",

  "how-to-set-search-limit": `先
    <a
      id="registrySearchLink"
      href="https://registry.npmjs.org/-/v1/search?text=maintainer:TO_FILL_MAINTAINER&size=TO_FILL_SIZE"
      target="_blank"
      >打开</a
    >
    搜索你想要的包，调整 &size 直到找到然后将 size 设置到此处`,
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
  https://github.com/legend80s/my-npm-dashboard`,
  "version.label": "pelican v{version}",

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
  暂无下载数据: "No download data yet.",
  图表加载失败: "Chart rendered failed.",

  "how-to-set-search-limit": `
    <a
      id="registrySearchLink"
      href="https://registry.npmjs.org/-/v1/search?text=maintainer:TO_FILL_MAINTAINER&size=TO_FILL_SIZE"
      target="_blank"
      >Click</a
    >
    and adjust \`&size\` until the pkg find then set it back here.`,
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
