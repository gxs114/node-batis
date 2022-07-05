"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqlMapper = exports.Sql = exports.Delete = exports.Update = exports.Insert = exports.Select = exports.SqlParam = void 0;
const funcMetaMap_1 = require("./funcMetaMap");
const generateQueryMap_1 = require("./generateQueryMap");
const NodeBatis_1 = require("./NodeBatis");
function SqlParam(id) {
    if (typeof id !== "string") {
        throw "[node-batis @Param error]: 参数 id 必须是一个字符串，内部隐士装换可能会导致重复[Object object]，请手动进行转换";
    }
    return function (target, funName, index) {
        let funInfoMap = funcMetaMap_1.funcMetaMap.get(target);
        if (!funInfoMap) {
            funcMetaMap_1.funcMetaMap.set(target, (funInfoMap = new Map()));
        }
        const meta = funInfoMap.get(funName);
        if (!meta) {
            funInfoMap.set(funName, { [index]: id });
        }
        else if (index in meta) {
            throw `[node-batis @Param error]: 函数参数 ${funName} 的 id(${meta[index]}) 已经存在，请勿重复注册`;
        }
    };
}
exports.SqlParam = SqlParam;
exports.Select = Sql;
exports.Insert = Sql;
exports.Update = Sql;
exports.Delete = Sql;
function Sql(sql) {
    return function (target, funName, des) {
        const originMethod = des.value;
        des.value = async function (...query) {
            const ins = (0, NodeBatis_1.getCurrentInstance)();
            const queryMap = (0, generateQueryMap_1.generateQueryMap)(target, funName, query);
            const result = ins.execInlineSql(queryMap, sql);
            return originMethod.apply(this, [...query, result]);
        };
    };
}
exports.Sql = Sql;
function SqlMapper(mapperId, sqlId) {
    return function (target, funName, des) {
        const originMethod = des.value;
        des.value = async function (...query) {
            const queryMap = (0, generateQueryMap_1.generateQueryMap)(target, funName, query);
            const ins = (0, NodeBatis_1.getCurrentInstance)();
            const result = await ins.execMapperSql({ mapperId, sqlId, queryMap });
            return originMethod.apply(this, [...query, result]);
        };
    };
}
exports.SqlMapper = SqlMapper;
//# sourceMappingURL=decorator.js.map