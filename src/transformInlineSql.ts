
import * as sqlstring from "sqlstring"

export function transformInlineSql (sql: string, queryMap: Record<string, string>) {
  return sql.replace(/#\{\s*(.*?)\s*\}/g, (_, v: string) => {
    const data = queryMap[v]
    return data ? sqlstring.escape(data) : v
  })
}