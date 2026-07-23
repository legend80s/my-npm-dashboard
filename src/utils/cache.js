/** @import { CacheData, FreshPackageDetail, PackageDetail } from '../index.type.js' */

// ============================================================
//  11. 缓存管理（localStorage）
// ============================================================

const CACHE_KEY = "pkg-marmot-cache"
export const CACHE_TTL_IN_HOURS = 12 // 12小时
export const CACHE_TTL_IN_MS = CACHE_TTL_IN_HOURS * 60 * 60 * 1000 // 12小时（毫秒）

/**
 * 获取缓存数据
 * @param {string} username - npm 用户名
 * @param {number} limit - 包数量限制
 * @returns {{ packages: FreshPackageDetail[], timestamp: number } | null}
 */
export function getCache(username, limit) {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) {
      return null
    }

    /**
     * @type {CacheData}
     */
    const data = JSON.parse(cached)
    // 验证缓存是否匹配当前请求
    if (data.username !== username || data.limit !== limit) {
      return null
    }

    // 检查是否过期
    if (Date.now() - data.timestamp > CACHE_TTL_IN_MS) {
      // 过期则清除
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    /** @type {FreshPackageDetail[]} */
    // @ts-expect-error
    const pkgs = data.packages

    pkgs.forEach((pkg) => {
      pkg.weeklyData?.forEach((wd) => {
        wd.startDate = new Date(wd.startDate)
        wd.endDate = new Date(wd.endDate)
      })
    })

    return { packages: pkgs, timestamp: data.timestamp }
  } catch (parseError) {
    console.error("解析失败清除缓存", parseError)
    // 解析失败则清除缓存
    localStorage.removeItem(CACHE_KEY)
    return null
  }
}

/**
 * 保存缓存数据
 * @param {string} username - npm 用户名
 * @param {number} limit - 包数量限制
 * @param {FreshPackageDetail[]} packages - 包数据数组
 * @param {number} timestamp - 缓存时间戳
 */
export function setCache(username, limit, packages, timestamp) {
  try {
    const data = {
      username,
      limit,
      packages,
      timestamp,
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch (e) {
    // localStorage 可能已满，静默失败
    console.warn("缓存保存失败:", e)
  }
}

/**
 * 清除缓存
 */
export function clearCache() {
  localStorage.removeItem(CACHE_KEY)
}

/**
 * 获取缓存剩余时间（用于显示）
 * @returns {string} 剩余时间描述
 */
export function getCacheTTL() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) {
      return "无缓存"
    }
    const data = JSON.parse(cached)
    const elapsed = Date.now() - data.timestamp
    const remaining = CACHE_TTL_IN_MS - elapsed
    if (remaining <= 0) {
      return "已过期"
    }
    const hours = Math.floor(remaining / (60 * 60 * 1000))
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return `${minutes}分钟`
  } catch (parseError) {
    console.error("getCacheTTL 缓存读取失败:", parseError)
    return "--"
  }
}
