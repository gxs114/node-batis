import { funcMetaMap } from "./funcMetaMap"
import { isPlainObject } from "./helper"

export function generateQueryMap (target: any, funName: string, query: any[]) {
  if (query.length === 0) {
    return {}
  }

  const meta = getMeta(target, funName)
  const firstId = meta && meta[0]
  let queryMap: Record<any, any> = {}


  if (query.length === 1) {
    if (firstId) {
      queryMap[firstId] = query[0]
    }
    else if (isPlainObject(query[0])) {
      queryMap = query[0]
    }
    else {
      queryMap.arg1 = query[0]
    }
    return queryMap
  }

  let defaultArgIndex = 1
  query.forEach((item, index) => {
    const id = meta && meta[index]
    id ? queryMap[id] = item : queryMap[`arg${defaultArgIndex++}`] = item
  })
  return queryMap
}

function getMeta (target: any, name: string) {
  const funInfoMap = funcMetaMap.get(target)
  if (!funInfoMap) {
    return
  }

  const meta = funInfoMap.get(name)
  if (!meta) {
    return
  }

  return meta
}