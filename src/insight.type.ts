import type { FreshPackageDetail } from "./index.type.js"

export interface MetricDescriptor {
  label: string
  get: (p: FreshPackageDetail) => { value: string; color?: string; title?: string }
}

export type IRanking = {
  key: string
  label: string
  labelDescription: string
  sortKey: (p: FreshPackageDetail) => number
  format: (n: number) => string
  unit: string
  metrics: MetricDescriptor[]
  ascending?: boolean
}
