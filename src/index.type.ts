// ============================================================
//  pkg-marmot 缓存数据类型定义
// ============================================================

type int = number

export type Hottest = { name: string; downloads: int; latestWeekDownloads: int }

// type Case2 = {
//   name: string
//   version: string
//   publishedAt: null
//   createdAt: null
//   downloads: never[]
//   totalDownloads: number
//   trend: number
//   github: {
//     owner: null
//     repo: null
//     stars: null
//     lastCommit: null
//     lastCommitDate: null
//   }
//   activeAt: null
//   error: any
// }
type Case1 = {
  name: string
  version: string
  publishedAt: string | null
  createdAt: string | null
  weeklyData?: {
    weekIndex: number
    startDate: Date
    endDate: Date
    total: number
    days: {
      date: string
      downloads: number
    }[]
  }[]
  totalDownloads: number
  trend: number
  github: {
    owner: null
    repo: null
    stars: null
    lastCommit: null
    lastCommitDate: null
  }
  activeAt: string | null
  error?: unknown
}

export type FreshPackageDetail = Case1

/**
 * 单日下载量数据
 */
type DailyDownload = {
  /** 日期字符串，格式: YYYY-MM-DD */
  date: string
  /** 当日下载量 */
  downloads: number
}

/**
 * 单周聚合下载量数据
 * 注意：startDate 和 endDate 在缓存中存储为 ISO 字符串
 * 使用时需要 new Date() 转换
 */
type WeeklyDownload = {
  weekIndex: number
  /** 周起始日期（ISO 字符串，如 "2026-07-15T00:00:00.000Z"） */
  startDate: string
  /** 周结束日期（ISO 字符串） */
  endDate: string
  /** 该周总下载量 */
  total: number
  /** 该周每日明细数据 */
  days: DailyDownload[]
}

/**
 * GitHub 仓库信息
 */
type GitHubInfo = {
  /** 仓库所有者，null 表示获取失败或无仓库 */
  owner: string | null
  /** 仓库名称，null 表示获取失败或无仓库 */
  repo: string | null
  /** Star 数量，null 表示获取失败 */
  stars: number | null
  /** 最近一次提交信息，null 表示获取失败 */
  lastCommit: string | null
  /** 最近一次提交日期（ISO 字符串），null 表示获取失败 */
  lastCommitDate: string | null
}

/**
 * 单个包的完整数据（缓存存储的对象）
 */
export type PackageDetail = {
  /** 包名 */
  name: string
  /** 最新版本号 */
  version: string
  /** 最新版本发布时间（ISO 字符串），null 表示获取失败 */
  publishedAt: string | null
  /** 包首次创建时间（ISO 字符串），null 表示获取失败 */
  createdAt: string | null
  /** 52周聚合下载量数据 */
  weeklyData: WeeklyDownload[]
  /** 52周总下载量 */
  totalDownloads: number
  /** 趋势百分比（正数=上升，负数=下降） */
  trend: number
  /** GitHub 相关数据 */
  github: GitHubInfo
  /** 活跃度排序用的时间戳（ISO 字符串）= max(发布时间, GitHub提交时间, 最近有下载的周) */
  activeAt: string | null
  /** 错误信息，仅当该包获取失败时存在 */
  error?: string
}

/**
 * localStorage 缓存结构
 * 所有日期字段均为 ISO 字符串，保证 JSON 序列化/反序列化不丢失信息
 */
export type CacheData = {
  /** 缓存的 npm 用户名 */
  username: string
  /** 缓存的包数量限制 */
  limit: number
  /** 缓存创建时间戳（毫秒） */
  timestamp: number
  /** 包数据数组 */
  packages: PackageDetail[]
}

// ============================================================
//  npm API 响应类型（用于参考）
// ============================================================

/**
 * npm search API 响应中的包摘要
 */
export type NpmSearchPackage = {
  name: string
  version: string
  date: string
  // ... 其他字段省略
}

/**
 * npm registry API 响应中的 time 字段
 */
export type NpmRegistryTime = {
  created: string
  modified: string
  [version: string]: string // 各个版本的发布时间
}

/**
 * npm registry API 响应
 */
export type NpmRegistryResponse = {
  name: string
  version: string
  time: NpmRegistryTime
  "dist-tags": {
    latest: string
    [tag: string]: string
  }
  repository?:
    | {
        type?: string
        url?: string
      }
    | string
  // ... 其他字段省略
}

/**
 * npm downloads API 响应
 */
export type NpmDownloadsResponse = {
  downloads: Array<{
    day: string
    downloads: number
  }>
  package: string
  start: string
  end: string
}

/**
 * GitHub API 仓库响应
 */
export type GitHubRepoResponse = {
  stargazers_count: number
  // ... 其他字段省略
}

/**
 * GitHub API 提交响应
 */
export type GitHubCommitResponse = {
  commit: {
    message: string
    committer: {
      date: string
    } | null
  }
  // ... 其他字段省略
}
