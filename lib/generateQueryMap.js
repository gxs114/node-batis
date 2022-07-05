"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQueryMap = void 0;
const funcMetaMap_1 = require("./funcMetaMap");
const helper_1 = require("./helper");
function generateQueryMap(target, funName, query) {
    if (query.length === 0) {
        return {};
    }
    const meta = getMeta(target, funName);
    const firstId = meta && meta[0];
    let queryMap = {};
    if (query.length === 1) {
        if (firstId) {
            queryMap[firstId] = query[0];
        }
        else if ((0, helper_1.isPlainObject)(query[0])) {
            queryMap = query[0];
        }
        else {
            queryMap.arg1 = query[0];
        }
        return queryMap;
    }
    let defaultArgIndex = 1;
    query.forEach((item, index) => {
        const id = meta && meta[index];
        id ? (queryMap[id] = item) : (queryMap[`arg${defaultArgIndex++}`] = item);
    });
    return queryMap;
}
exports.generateQueryMap = generateQueryMap;
function getMeta(target, name) {
    const funInfoMap = funcMetaMap_1.funcMetaMap.get(target);
    if (!funInfoMap) {
        return;
    }
    const meta = funInfoMap.get(name);
    if (!meta) {
        return;
    }
    return meta;
}
//# sourceMappingURL=generateQueryMap.js.map