import { funcMetaMap } from "./funcMetaMap"
import { generateQueryMap } from "./generateQueryMap"
import { getCurrentInstance } from "./NodeBatis"

export function SqlParam(id: string) {
  if (typeof id !== "string") {
    throw "[node-batis @Param error]: 参数 id 必须是一个字符串，内部隐士装换可能会导致重复[Object object]，请手动进行转换"
  }

  return function (target: any, funName: string, index: number) {
    let funInfoMap = funcMetaMap.get(target)
    if (!funInfoMap) {
      funcMetaMap.set(target, (funInfoMap = new Map()))
    }

    const meta = funInfoMap.get(funName)
    if (!meta) {
      funInfoMap.set(funName, { [index]: id })
    } else if (index in meta) {
      throw `[node-batis @Param error]: 函数参数 ${funName} 的 id(${meta[index]}) 已经存在，请勿重复注册`
    }
  }
}

export const Select = Sql
export const Insert = Sql
export const Update = Sql
export const Delete = Sql
export function Sql(sql: string) {
  return function (target: any, funName: string, des: PropertyDescriptor) {
    const originMethod = des.value
    des.value = async function (...query: any[]) {
      const ins = getCurrentInstance()
      const queryMap = generateQueryMap(target, funName, query)
      const result = ins.execInlineSql(queryMap, sql)
      return originMethod.apply(this, [...query, result])
    }
  }
}

export function SqlMapper(mapperId: string, sqlId: string) {
  return function (target: any, funName: string, des: PropertyDescriptor) {
    const originMethod = des.value
    des.value = async function (...query: any[]) {
      const queryMap = generateQueryMap(target, funName, query)
      const ins = getCurrentInstance()
      const result = await ins.execMapperSql({ mapperId, sqlId, queryMap })
      return originMethod.apply(this, [...query, result])
    }
  }
}
