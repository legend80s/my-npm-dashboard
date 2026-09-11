export type NpmPackDryRunJSON = NpmPackDryRunJSONItem[]

export type NpmPackDryRunJSONItem = {
  id: string
  name: string
  version: string
  size: number
  unpackedSize: number
  shasum: string
  integrity: string
  filename: string
  files: File[]
  entryCount: number
  bundled: []
}

interface File {
  path: string
  size: number
  mode: number
}
