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
exports.parseXML = void 0;
const fs_1 = require("fs");
const htmlparser2 = __importStar(require("htmlparser2"));
function parseXML(pathOrTemplate, isTemplate = false) {
    const template = isTemplate
        ? pathOrTemplate
        : (0, fs_1.readFileSync)(pathOrTemplate, "utf-8");
    const doc = htmlparser2.parseDocument(template);
    return parseSqlNode(doc);
}
exports.parseXML = parseXML;
function parseSqlNode(doc) {
    const fragment = new Map();
    const sql = new Map();
    const content = doc.children.find(node => node.name === "content").children;
    const fragTags = content.filter((node) => node.type === "tag" && node.name === "fragment");
    const sqlTags = content.filter((node) => node.type === "tag" && node.name === "sql");
    fragTags.forEach(item => {
        const [id, value] = paseFragment(item);
        fragment.set(id, " " + value.trim() + " ");
    });
    sqlTags.forEach(item => {
        const [id, factory] = parseSql(item, fragment);
        sql.set(id, factory);
    });
    return [fragment, sql];
}
function paseFragment(node) {
    return [node.attribs.id, node.children[0].data];
}
function parseSql(node, fragmentMap) {
    let sql = "";
    node.children.forEach(item => {
        const _subSql = parseBlockSql(item, fragmentMap);
        _subSql && (sql += _subSql);
    });
    sql = sql.replace(/#\{\s*(.*?)\s*\}/g, (_, v) => `\${ __sql_escape( ${v} ) }`);
    return [
        node.attribs.id,
        new Function("query", "helper", `
      const { __sql_where, __sql_escape, __sql_exist } = helper
      with(query) {
        return \`${sql}\`
      }
    `)
    ];
}
function parseBlockSql(item, fragmentMap) {
    if (item.type === "text") {
        const sql = item.data.trim();
        return sql.length > 0 ? sql + " " : "";
    }
    else if (item.type === "tag" && item.name === "include") {
        return fragmentMap.get(item.attribs.refid);
    }
    else if (item.type === "tag" && item.name === "if") {
        return parseIf(item, fragmentMap);
    }
    else if (item.type === "tag" && item.name === "for") {
        return parseFor(item, fragmentMap);
    }
    else if (item.type === "tag" && item.name === "where") {
        let sql = "";
        item.children.forEach(cItem => {
            const _subSql = parseBlockSql(cItem, fragmentMap);
            _subSql && (sql += _subSql);
        });
        return "${__sql_where(`" + sql.trimStart() + "`)}";
    }
    else {
        throw "node-batis: 未知的行内 parse 类型";
    }
}
function parseIf(node, fragmentMap) {
    const condition = node.attribs.test;
    let sql = "\n${" + condition.replace("and", "&&") + " ? `";
    node.children.forEach(item => {
        const _subSql = parseBlockSql(item, fragmentMap).trim();
        _subSql && (sql += _subSql);
    });
    return sql + ' ` : ""}';
}
function parseFor(node, fragmentMap) {
    const { collection, item } = node.attribs;
    let { open, close, separator } = node.attribs;
    open = open ?? "";
    close = close ?? "";
    separator = separator ?? "";
    let sql = "";
    node.children.forEach(cItem => {
        const _subSql = parseBlockSql(cItem, fragmentMap);
        _subSql && (sql += _subSql);
    });
    return `${open} \${\n ${collection}.reduce(
    (acc, ${item}) => {
      return acc + "${separator}" + \`${sql}\`
    }, ""
  ).slice(1)} ${close}`;
}
//# sourceMappingURL=parseXML.js.map