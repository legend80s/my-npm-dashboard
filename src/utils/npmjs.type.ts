/**
 * https://api.npmjs.org/downloads/range/2025-07-22:2026-07-20/sse-stuntman
 */
export type NpmPkgDownloadsResp = {
  start: string
  end: string
  package: string
  downloads: Download[]
}

type Download = {
  downloads: number
  day: string
}

/**
 * https://registry.npmjs.org/-/v1/search?text=maintainer:legend80s&size=2
 */
export type NpmPkgSearchResp = {
  objects: Object[]
  total: number
  time: string
}

interface Object {
  downloads: Downloads
  dependents: string
  updated: string
  searchScore: number
  package: Package
  score: Score
  flags: Flags
}

interface Flags {
  insecure: number
}

interface Score {
  final: number
  detail: Detail
}

interface Detail {
  popularity: number
  quality: number
  maintenance: number
}

interface Package {
  name: string
  keywords: string[]
  version: string
  description: string
  sanitized_name: string
  publisher: Publisher
  maintainers: Publisher[]
  license: string
  date: string
  links: Links
}

interface Links {
  homepage: string
  repository: string
  bugs: string
  npm: string
}

interface Publisher {
  email: string
  username: string
}

interface Downloads {
  monthly: number
  weekly: number
}

/**
 * https://registry.npmjs.org/sse-stuntman
 */
export type NpmPkgResp = {
  _id: string
  _rev: string
  name: string
  "dist-tags": Disttags
  versions: Versions
  time: Time
  bugs: Bugs
  license: string
  homepage: string
  keywords: string[]
  repository: Repository
  description: string
  maintainers: Maintainer[]
  readme: string
  readmeFilename: string
}

interface Time {
  created: string
  modified: string
  [version: string]: string
  // "0.0.2": string
  // "0.0.3": string
  // "0.0.4": string
  // "0.0.5": string
  // "0.0.6": string
  // "1.0.0": string
  // "1.1.0": string
  // "1.1.1": string
  // "1.1.2": string
}

interface Versions {
  "0.0.2": _002
  "0.0.3": _003
  "0.0.4": _003
  "0.0.5": _003
  "0.0.6": _006
  "1.0.0": _006
  "1.1.0": _110
  "1.1.1": _110
  "1.1.2": _110
}

interface _110 {
  name: string
  version: string
  keywords: string[]
  author: string
  license: string
  _id: string
  maintainers: Maintainer[]
  homepage: string
  bugs: Bugs
  bin: Bin
  dist: Dist
  main: string
  type: string
  gitHead: string
  scripts: Scripts2
  _npmUser: Maintainer
  repository: Repository
  _npmVersion: string
  description: string
  directories: Directories
  _nodeVersion: string
  _hasShrinkwrap: boolean
  devDependencies: DevDependencies
  _npmOperationalInternal: NpmOperationalInternal
}

interface _006 {
  name: string
  version: string
  keywords: string[]
  author: string
  license: string
  _id: string
  maintainers: Maintainer[]
  homepage: string
  bugs: Bugs
  bin: Bin
  dist: Dist
  type: string
  gitHead: string
  scripts: Scripts2
  _npmUser: Maintainer
  repository: Repository
  _npmVersion: string
  description: string
  directories: Directories
  _nodeVersion: string
  _hasShrinkwrap: boolean
  devDependencies: DevDependencies
  _npmOperationalInternal: NpmOperationalInternal
}

interface Scripts2 {
  test: string
  start: string
  coverage: string
  "pub:major": string
  "pub:minor": string
  "pub:patch": string
  typecheck: string
  preversion: string
  postversion: string
}

interface _003 {
  name: string
  version: string
  keywords: string[]
  author: string
  license: string
  _id: string
  maintainers: Maintainer[]
  homepage: string
  bugs: Bugs
  bin: Bin
  dist: Dist
  type: string
  gitHead: string
  scripts: Scripts
  _npmUser: Maintainer
  repository: Repository
  _npmVersion: string
  description: string
  directories: Directories
  _nodeVersion: string
  _hasShrinkwrap: boolean
  devDependencies: DevDependencies
  _npmOperationalInternal: NpmOperationalInternal
}

interface Repository {
  url: string
  type: string
}

interface Bugs {
  url: string
}

interface _002 {
  name: string
  version: string
  keywords: string[]
  author: string
  license: string
  _id: string
  maintainers: Maintainer[]
  bin: Bin
  dist: Dist
  type: string
  gitHead: string
  scripts: Scripts
  _npmUser: Maintainer
  _npmVersion: string
  description: string
  directories: Directories
  _nodeVersion: string
  _hasShrinkwrap: boolean
  devDependencies: DevDependencies
  _npmOperationalInternal: NpmOperationalInternal
}

interface NpmOperationalInternal {
  tmp: string
  host: string
}

interface DevDependencies {
  "@types/node": string
}

type Directories = {}

interface Scripts {
  test: string
  start: string
  "pub:major": string
  "pub:minor": string
  "pub:patch": string
  typecheck: string
  preversion: string
  postversion: string
}

interface Dist {
  shasum: string
  tarball: string
  fileCount: number
  integrity: string
  signatures: Signature[]
  unpackedSize: number
}

interface Signature {
  sig: string
  keyid: string
}

interface Bin {
  "sse-stuntman": string
}

interface Maintainer {
  name: string
  email: string
}

interface Disttags {
  latest: string
}
