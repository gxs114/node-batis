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
exports.isPlainObject = exports.helper = void 0;
const sqlstring = __importStar(require("sqlstring"));
function __sql_where(sql) {
    sql = sql.trimStart();
    if (sql.startsWith("and")) {
        sql = sql.slice(3);
    }
    else if (sql.startsWith("or")) {
        sql = sql.slice(2);
    }
    return sql.length > 0 ? "where " + sql.trimStart() : "";
}
exports.helper = { __sql_where, __sql_escape: sqlstring.escape };
const isPlainObject = (value) => {
    return Object.prototype.toString.call(value) === "[object Object]";
};
exports.isPlainObject = isPlainObject;
//# sourceMappingURL=helper.js.map