/** @import { NpmPkgResp, Package } from './npmjs.type.js' */
/** @import { CacheData, CaseSuccess, CaseError, FreshPackageDetail } from '../index.type.js' */
/** @import { int } from './base.type.js' */

import {
  fetchDependentsCount,
  fetchGitHubLastCommit,
  fetchGitHubStars,
  fetchPackageMetadata,
  fetchUserPackages,
  fetchYearlyWeeklyDownloads,
} from "./api.js"
import { byActiveAtDesc, CACHE_KEY, CACHE_TTL_IN_MS } from "./cache.js"

export const RANKING_TOP_N = 5

/**
 *
 * @param {NpmPkgResp} pkgMeta
 * @returns
 */
function parseGitHubRepo(pkgMeta) {
  const repo = pkgMeta.repository

  if (!repo) {
    return null
  }

  if (repo.url) {
    const match = repo.url.match(/github\.com[:/]([^/]+)\/([^/.]+)/)
    if (match) {
      return { owner: match[1], repo: match[2] }
    }
  }

  return null
}

/**
 * 从缓存中读取数据（仅匹配 username，不再匹配 limit）
 * @param {string} username
 * @returns {{ packages: FreshPackageDetail[], timestamp: number } | null}
 */
export function readCache(username) {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) {
      return null
    }
    /**
     * @type {CacheData}
     */
    const data = JSON.parse(raw)
    if (data.username !== username) {
      return null
    }
    if (Date.now() - data.timestamp > CACHE_TTL_IN_MS) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    const pkgs = data.packages
    for (const pkg of pkgs) {
      if (pkg.weeklyData) {
        for (const w of pkg.weeklyData) {
          // @ts-expect-error
          w.startDate = new Date(w.startDate)
          // @ts-expect-error
          w.endDate = new Date(w.endDate)
        }
      }
    }

    // console.log(
    //   "pkgs before sorting:",
    //   pkgs.map((x) => x.name),
    // )
    pkgs.sort(byActiveAtDesc)
    // console.log(
    //   "pkgs after sorting:",
    //   pkgs.map((x) => x.name),
    // )

    return { packages: pkgs, timestamp: data.timestamp }
  } catch {
    localStorage.removeItem(CACHE_KEY)
    return null
  }
}

/**
 * 写入缓存
 * @param {string} username
 * @param {FreshPackageDetail[]} packages
 */
export function writeCache(username, packages) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ username, packages, timestamp: Date.now() }))
  } catch (e) {
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
 *
 * @param {Pick<Package, 'name' | 'version'> & { date?: string }} pkg
 * @param {int} [dependents]
 * @param {boolean} [forceRefresh]
 * @return {Promise<CaseSuccess>}
 */
export async function fetchPackageDetails({ name, version, date }, dependents, forceRefresh = false) {
  const meta = await fetchPackageMetadata(name, forceRefresh)
  const downloads = await fetchYearlyWeeklyDownloads(name, forceRefresh)
  version = meta["dist-tags"]?.latest || version || "--"
  const publishedAt = meta.time[version] || meta.time.modified || date
  const createdAt = meta.time.created

  const latestVerData =
    version !== "--"
      ? // @ts-expect-error
        meta.versions?.[version]
      : null
  const unpackedSize = latestVerData?.dist?.unpackedSize ?? null
  const dependencyCount = Object.keys(latestVerData?.dependencies || {}).length
  const versionCount = Object.keys(meta.versions || {}).length
  dependents = dependents ?? (await fetchDependentsCount(name))

  const github = {
    owner: "",
    repo: "",
    /** @type {null | int} */
    stars: 0,
    lastCommit: "",
    lastCommitDate: "",
  }
  const ghRepo = parseGitHubRepo(meta)
  if (ghRepo) {
    github.owner = ghRepo.owner
    github.repo = ghRepo.repo
    try {
      const starData = await fetchGitHubStars(ghRepo.owner, ghRepo.repo, forceRefresh)
      github.stars = starData.stars
    } catch {
      /* silent */
    }
    try {
      const commitData = await fetchGitHubLastCommit(ghRepo.owner, ghRepo.repo, forceRefresh)
      github.lastCommit = commitData.message
      github.lastCommitDate = commitData.date
    } catch {
      /* silent */
    }
  }

  let activeAt = publishedAt
  if (github.lastCommitDate && new Date(github.lastCommitDate) > new Date(activeAt || 0)) {
    activeAt = github.lastCommitDate
  }

  const detail = {
    name,
    version,
    publishedAt,
    createdAt,
    weeklyData: downloads.weekly,
    totalDownloads: downloads.total,
    trend: downloads.trend,
    github,
    activeAt,
    unpackedSize,
    dependencyCount,
    versionCount,
    dependents,
  }

  return detail
}

/**
 * 纯 API 拉取所有包数据（不含缓存读写副作用）
 * @param {string} username
 * @returns {Promise<{ packages: FreshPackageDetail[], username: string }>}
 */
/**
 * @param {string} username
 * @param {{ onPackage?: (pkg: FreshPackageDetail, done: number, total: number) => void, forceRefresh?: boolean }} [options]
 */
export async function fetchRaw(username, options = {}) {
  const { onPackage, forceRefresh = false } = options
  const { packages: pkgList, dependents: dependentsMap } = await fetchUserPackages(username, forceRefresh)

  /** @type {FreshPackageDetail[]} */
  const pkgDetails = []

  for (const [index, pkg] of pkgList.entries()) {
    try {
      const detail = await fetchPackageDetails(pkg, dependentsMap[pkg.name], forceRefresh)
      pkgDetails.push(detail)
      onPackage?.(detail, index + 1, pkgList.length)
    } catch (err) {
      /** @type {CaseError} */
      const fallbackDetail = {
        name: pkg.name,
        version: "--",
        publishedAt: null,
        createdAt: null,
        totalDownloads: 0,
        trend: 0,
        github: {
          owner: "",
          repo: "",
          stars: null,
          lastCommit: "",
          lastCommitDate: "",
        },
        activeAt: null,
        unpackedSize: null,
        dependencyCount: 0,
        versionCount: 0,
        dependents: 0,
        error: err instanceof Error ? err.message : String(err),
      }
      pkgDetails.push(fallbackDetail)
      onPackage?.(fallbackDetail, index + 1, pkgList.length)
    }
  }

  return { packages: pkgDetails, username }
}

/**
 * 加载数据：先读缓存，未命中则 fetchRaw + 写缓存
 * @param {string} username
 * @param {boolean} [forceRefresh=false]
 * @returns {Promise<{ packages: FreshPackageDetail[], username: string, fromCache: boolean, timestamp: number }>}
 */
export async function loadData(username, forceRefresh = false) {
  if (!forceRefresh) {
    const cached = readCache(username)
    if (cached) {
      return {
        packages: cached.packages,
        username,
        fromCache: true,
        timestamp: cached.timestamp,
      }
    }
  }
  const data = await fetchRaw(username)
  writeCache(username, data.packages)
  return {
    packages: data.packages,
    username,
    fromCache: false,
    timestamp: Date.now(),
  }
}
