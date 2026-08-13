export class MyURL extends URL {
  /**
   *
   * @param {string} url
   * @param {Record<string, string>} allQuery
   */
  constructor(url, allQuery) {
    super(url)

    // 透传所有参数到 url
    Object.entries(allQuery).forEach(([key, value]) => {
      this.searchParams.set(key, value)
    })
  }
}
