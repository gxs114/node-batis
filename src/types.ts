import { helper } from "./helper"

export type SqlPool = Map<
  string | symbol,
  {
    sql: SqlMap
    fragment: FragmentMap
  }
>

export type Node = {
  type: string
  name: string
  data: string
  attribs: Record<string, string | undefined>
  children: Array<Node>
}

export type FragmentMap = Map<string, string>
export type SqlMap = Map<
  string,
  (value: any, helperFn?: typeof helper) => string
>

export type QueryMap = Record<string, any>
