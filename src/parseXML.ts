import { readFileSync } from "fs"

import * as htmlparser2 from "htmlparser2"

import { Node, FragmentMap, SqlMap } from "./types"

export function parseXML(path: string) {
  const template = readFileSync(path, "utf-8")
  const doc = htmlparser2.parseDocument(template)
  return parseSqlNode(doc as any)
}

function parseSqlNode(doc: Node) {
  const fragment: FragmentMap = new Map()
  const sql: SqlMap = new Map()

  const content = doc.children.find(node => node.name === "content")!.children
  const fragTags = content.filter(
    (node: any) => node.type === "tag" && node.name === "fragment"
  )
  const sqlTags = content.filter(
    (node: any) => node.type === "tag" && node.name === "sql"
  )

  fragTags.forEach(item => {
    const [id, value] = paseFragment(item)
    fragment.set(id, " " + value.trim() + " ")
  })

  sqlTags.forEach(item => {
    const [id, factory] = parseSql(item, fragment)
    sql.set(id, factory as any)
  })
  return [fragment, sql] as const
}

function paseFragment(node: Node) {
  return [node.attribs.id, node.children[0].data] as readonly [string, string]
}

function parseSql(node: Node, fragmentMap: FragmentMap) {
  let sql = ""
  node.children.forEach(item => {
    const _subSql = parseBlockSql(item, fragmentMap)
    _subSql && (sql += _subSql)
  })

  sql = sql.replace(
    /#\{\s*(.*?)\s*\}/g,
    (_, v: string) => `\${ __sql_escape( ${v} ) }`
  )
  return [
    node.attribs.id!,
    new Function(
      "query",
      "helper",
      `
      const { __sql_where, __sql_escape, __sql_exist } = helper
      with(query) {
        return \`${sql}\`
      }
    `
    )
  ] as const
}

function parseBlockSql(item: Node, fragmentMap: FragmentMap): string {
  if (item.type === "text") {
    const sql = item.data.trim()
    return sql.length > 0 ? sql + " " : ""
  } else if (item.type === "tag" && item.name === "include") {
    return fragmentMap.get(item.attribs.refid!)!
  } else if (item.type === "tag" && item.name === "if") {
    return parseIf(item, fragmentMap)
  } else if (item.type === "tag" && item.name === "for") {
    return parseFor(item, fragmentMap)
  } else if (item.type === "tag" && item.name === "where") {
    let sql = ""

    item.children.forEach(cItem => {
      const _subSql = parseBlockSql(cItem, fragmentMap)
      _subSql && (sql += _subSql)
    })

    return "${__sql_where(`" + sql.trimStart() + "`)}"
  } else {
    throw "node-batis: 未知的行内 parse 类型"
  }
}

function parseIf(node: Node, fragmentMap: FragmentMap) {
  const condition = node.attribs.test!
  let sql = "\n${" + condition.replace("and", "&&") + " ? `"
  node.children.forEach(item => {
    const _subSql = parseBlockSql(item, fragmentMap).trim()
    _subSql && (sql += _subSql)
  })
  return sql + ' ` : ""}'
}

function parseFor(node: Node, fragmentMap: FragmentMap) {
  const { collection, item } = node.attribs
  let { open, close, separator } = node.attribs

  open = open ?? ""
  close = close ?? ""
  separator = separator ?? ""

  let sql = ""
  node.children.forEach(cItem => {
    const _subSql = parseBlockSql(cItem, fragmentMap)
    _subSql && (sql += _subSql)
  })

  return `${open} \${\n ${collection!}.reduce(
    (acc, ${item!}) => {
      return acc + "${separator}" + \`${sql}\`
    }, ""
  ).slice(1)} ${close}`
}
