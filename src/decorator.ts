import { Logger } from "@nestjs/common"

import { funcMetaMap } from "./funcMetaMap"
import { generateQueryMap } from "./generateQueryMap"
import { helper } from "./helper"
import { getCurrentInstance } from "./index"
import { transformInlineSql } from "./transformInlineSql"




export function SqlParam (id: string) {
  if (typeof id !== "string") {
    throw "[node-batis @Param error]: 参数 id 必须是一个字符串，内部隐士装换可能会导致重复[Object object]，请手动进行转换"
  }

  return function (target: any, funName: string, index: number) {
    let funInfoMap = funcMetaMap.get(target)
    if (!funInfoMap) {
      funcMetaMap.set(target, funInfoMap = new Map())
    }

    const meta = funInfoMap.get(funName)
    if (!meta) {
      funInfoMap.set(funName, { [index]: id })
    }
    else if (index in meta) {
      throw `[node-batis @Param error]: 函数参数 ${funName} 的 id(${meta[index]}) 已经存在，请勿重复注册`
    }
  }
}


export const Select = Sql
export const Insert = Sql
export const Update = Sql
export const Delete = Sql
export function Sql (sql: string) {
  return function (target: any, funName: string, des: PropertyDescriptor) {
    const originMethod = des.value
    des.value = async function (...query: any[]) {
      const ins = getCurrentInstance().options
      const queryMap = generateQueryMap(target, funName, query)
      const _sql = transformInlineSql(sql, queryMap)
      const result = await Promise.resolve(ins.exec(_sql))
      return originMethod.apply(this, [...query, result])
    }
  }
}

export function SqlMapper (mapperId: string, sqlId: string) {
  return function (target: any, funName: string, des: PropertyDescriptor) {
    const originMethod = des.value
    des.value = async function (...query: any[]) {
      const ins = getCurrentInstance()
      const sqlMap = ins.sqlMap.get(mapperId)
      if (!sqlMap) {
        throw `[node-batis @SqlMapper error]: 当前获取的 mapper(${mapperId}) 不存在，请正确填写 mapper id`
      }

      const sqlFactory = sqlMap.sql.get(sqlId)
      if (!sqlFactory) {
        throw `[node-batis @SqlMapper error]: 当前获取的 sql(${sqlId}) 不存在，请正确填写 sqlId`
      }

      const queryMap = generateQueryMap(target, funName, query)
      let _sql = ""
      try {
        _sql = sqlFactory(queryMap, helper).trim()
      }
      catch (e) {
        throw "[node-batis error]: sql 生成过程出错"
      }

      try {
        const result = await Promise.resolve(ins.options.exec(_sql))
        return originMethod.apply(this, [...query, result])
      }
      catch (e) {
        Logger.error(`sql 执行出错，执行 SQL:[${_sql}]`, "node-batis")
        throw "[node-batis]: sql 执行出错"
      }
    }
  }
}