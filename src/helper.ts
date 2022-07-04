import * as sqlstring from "sqlstring"

function __sql_where(sql: string) {
  sql = sql.trimStart()

  if (sql.startsWith("and")) {
    sql = sql.slice(3)
  } else if (sql.startsWith("or")) {
    sql = sql.slice(2)
  }
  return sql.length > 0 ? "where " + sql.trimStart() : ""
}

export const helper = { __sql_where, __sql_escape: sqlstring.escape }

export const isPlainObject = (value: unknown): boolean => {
  return Object.prototype.toString.call(value) === "[object Object]"
}
