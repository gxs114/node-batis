import { parse, resolve } from "path"

import * as fg from "fast-glob"

import { parseXML } from "./parseXML"
import { SqlPool } from "./types"

interface NodeBatisOptions {
  entities: string | string[]
  exec: (sql: string) => any
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

  public sqlMap: SqlPool = new Map()

  public root = process.cwd()

  public xmLPath: string[]

  constructor(options: NodeBatisOptions) {
    this.options = options

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
}
