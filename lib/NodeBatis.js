"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeBatis = exports.getCurrentInstance = void 0;
const path_1 = require("path");
const fg = __importStar(require("fast-glob"));
const parseXML_1 = require("./parseXML");
const transformInlineSql_1 = require("./transformInlineSql");
const helper_1 = require("./helper");
let activeInstance;
const getCurrentInstance = () => {
    if (!activeInstance) {
        throw "[node-batis getCurrentInstance error]: 当前尚未进行实例初始化，请勿进行调用";
    }
    return activeInstance;
};
exports.getCurrentInstance = getCurrentInstance;
class NodeBatis {
    options;
    root = process.cwd();
    sqlMap = new Map();
    xmLPath;
    constructor(options) {
        if (activeInstance) {
            throw "[node-batis constructor error]: node-batis 实例已经存在，请勿重复初始化";
        }
        this.options = options;
        this.appendMapperSql({ entities: options.entities });
        activeInstance = this;
    }
    getSql(mapperId, sqlId, query) {
        const map = this.sqlMap;
        const mapper = map.get(mapperId);
        if (!mapper) {
            throw ("[node-batis getSql error]: 当前获取的 sql mapper 不存在，mapperId 为" +
                mapperId);
        }
        const sqlFactory = mapper.sql.get(sqlId);
        if (!sqlFactory) {
            throw `[node-batis getSql error]: 当前获取的 mapper${mapperId} 中未创建 id 为 ${sqlId} 的语句`;
        }
        try {
            return sqlFactory(query);
        }
        catch (e) {
            console.error(`[node-batis getSql error]: 当前 sql 创建 ${mapperId}.${sqlId} 出错`);
            throw e;
        }
    }
    resolvePath(p) {
        return (0, path_1.resolve)(this.root, p) + "/**/*.xml";
    }
    async execInlineSql(queryMap, sql) {
        if (!(0, helper_1.isPlainObject)(queryMap) || !sql) {
            throw "[node-batis execInlineSql error]: queryMap, sql 参数为必填项";
        }
        const _sql = (0, transformInlineSql_1.transformInlineSql)(sql, queryMap);
        return await Promise.resolve(this.options.exec(_sql));
    }
    async execMapperSql(options) {
        const { mapperId, sqlId, queryMap } = options;
        if (!mapperId || !sqlId || !(0, helper_1.isPlainObject)(queryMap)) {
            throw "[node-batis execMapperSql error]: mapperId, sqlId, queryMap, sql 参数为必填项";
        }
        const sqlMap = this.sqlMap.get(mapperId);
        if (!sqlMap) {
            throw `[node-batis @SqlMapper error]: 当前获取的 mapper(${mapperId}) 不存在，请正确填写 mapper id`;
        }
        const sqlFactory = sqlMap.sql.get(sqlId);
        if (!sqlFactory) {
            throw `[node-batis @SqlMapper error]: 当前获取的 sql(${sqlId}) 不存在，请正确填写 sqlId`;
        }
        let _sql = "";
        try {
            _sql = sqlFactory(queryMap, helper_1.helper).trim();
        }
        catch (e) {
            throw "[node-batis error]: sql 生成过程出错";
        }
        try {
            return await Promise.resolve(this.options.exec(_sql));
        }
        catch (e) {
            throw "[node-batis]: sql 执行出错";
        }
    }
    async appendMapperSql(options) {
        const { entities } = options;
        this.xmLPath = fg.sync(Array.isArray(entities)
            ? entities.map(this.resolvePath.bind(this))
            : [this.resolvePath(entities)]);
        this.xmLPath.forEach(path => {
            const { name } = (0, path_1.parse)(path);
            const [fragment, sql] = (0, parseXML_1.parseXML)(path);
            this.sqlMap.set(name, { fragment, sql });
        });
    }
}
exports.NodeBatis = NodeBatis;
//# sourceMappingURL=NodeBatis.js.map