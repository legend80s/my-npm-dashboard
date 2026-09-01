export type SVGString = `<svg xmlns=${string}>${string}</svg>`

export type DrawSVG = (
  props?: Partial<{ width: string; verticalAlign: CSSStyleProperties["verticalAlign"] }>,
  className?: string,
) => SVGString
