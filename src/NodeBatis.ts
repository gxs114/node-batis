import { parse, resolve } from "path"

import * as fg from "fast-glob"

import { parseXML } from "./parseXML"
import { QueryMap, SqlPool } from "./types"
import { transformInlineSql } from "./transformInlineSql"
import { helper, isPlainObject } from "./helper"

export interface NodeBatisOptions {
  entities: string | string[]
  exec: (sql: string) => any
  Logger?: (message: string) => any
}

let activeInstance: NodeBatis | undefined
export const getCurrentInstance = () => {
  if (!activeInstance) {
    throw "[node-batis getCurrentInstance error]: 当前尚未进行实例初始化，请勿进行调用"
  }
  return activeInstance
}

export class NodeBatis {
  public options: NodeBatisOptions

  public root = process.cwd()

  public sqlMap: SqlPool = new Map()

  public xmLPath: string[]

  constructor(options: NodeBatisOptions) {
    if (activeInstance) {
      throw "[node-batis constructor error]: node-batis 实例已经存在，请勿重复初始化"
    }

    this.options = options
    this.appendMapperSql({ entities: options.entities })
    activeInstance = this as any
  }

  getSql(mapperId: string, sqlId: string, query: unknown) {
    const map = this.sqlMap
    const mapper = map.get(mapperId)

    if (!mapper) {
      throw (
        "[node-batis getSql error]: 当前获取的 sql mapper 不存在，mapperId 为" +
        mapperId
      )
    }

    const sqlFactory = mapper.sql.get(sqlId)

    if (!sqlFactory) {
      throw `[node-batis getSql error]: 当前获取的 mapper${mapperId} 中未创建 id 为 ${sqlId} 的语句`
    }

    try {
      return sqlFactory(query)
    } catch (e: any) {
      console.error(
        `[node-batis getSql error]: 当前 sql 创建 ${mapperId}.${sqlId} 出错`
      )
      throw e
    }
  }

  resolvePath(p: string) {
    return resolve(this.root, p) + "/**/*.xml"
  }

  async execInlineSql(queryMap: QueryMap, sql: string) {
    if (!isPlainObject(queryMap) || !sql) {
      throw "[node-batis execInlineSql error]: queryMap, sql 参数为必填项"
    }

    const _sql = transformInlineSql(sql, queryMap)
    return await Promise.resolve(this.options.exec(_sql))
  }

  async execMapperSql(options: {
    queryMap: QueryMap
    mapperId: string
    sqlId: string
  }) {
    const { mapperId, sqlId, queryMap } = options
    if (!mapperId || !sqlId || !isPlainObject(queryMap)) {
      throw "[node-batis execMapperSql error]: mapperId, sqlId, queryMap, sql 参数为必填项"
    }

    const sqlMap = this.sqlMap.get(mapperId)
    if (!sqlMap) {
      throw `[node-batis @SqlMapper error]: 当前获取的 mapper(${mapperId}) 不存在，请正确填写 mapper id`
    }

    const sqlFactory = sqlMap.sql.get(sqlId)
    if (!sqlFactory) {
      throw `[node-batis @SqlMapper error]: 当前获取的 sql(${sqlId}) 不存在，请正确填写 sqlId`
    }

    let _sql = ""
    try {
      _sql = sqlFactory(queryMap, helper).trim()
    } catch (e) {
      throw "[node-batis error]: sql 生成过程出错"
    }

    try {
      return await Promise.resolve(this.options.exec(_sql))
    } catch (e) {
      // Logger.error(`sql 执行出错，执行 SQL:[${_sql}]`, "node-batis")
      throw "[node-batis]: sql 执行出错"
    }
  }

  async appendMapperSql(options: { entities: string | string[] }) {
    const { entities } = options

    this.xmLPath = fg.sync(
      Array.isArray(entities)
        ? entities.map(this.resolvePath.bind(this))
        : [this.resolvePath(entities)]
    )
    this.xmLPath.forEach(path => {
      const { name } = parse(path)
      const [fragment, sql] = parseXML(path)

      this.sqlMap.set(name, { fragment, sql })
    })
  }
}
