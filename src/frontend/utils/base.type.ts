export type int = number

// https://gist.github.com/webstrand/7e8066ee123bd3df4157d5ebd0618a26
declare class TypeErr<M> {
  #private: M
}

export type UnidentifiedError = TypeErr<"can not identify type by selector">

type Contains<S extends string, Sub extends string> = S extends `${string}${Sub}${string}` ? true : false

export type InferElementType<T extends string, Fallback = never> =
  Contains<T, "Link"> extends true ? HTMLAnchorElement : Contains<T, "Input"> extends true ? HTMLInputElement : Fallback
