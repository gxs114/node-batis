import { QueryMap, SqlPool } from "./types";
export interface NodeBatisOptions {
    entities: string | string[];
    exec: (sql: string) => any;
    Logger?: (message: string) => any;
}
export declare const getCurrentInstance: () => NodeBatis;
export declare class NodeBatis {
    options: NodeBatisOptions;
    root: string;
    sqlMap: SqlPool;
    xmLPath: string[];
    constructor(options: NodeBatisOptions);
    getSql(mapperId: string, sqlId: string, query: unknown): string;
    resolvePath(p: string): string;
    execInlineSql(queryMap: QueryMap, sql: string): Promise<any>;
    execMapperSql(options: {
        queryMap: QueryMap;
        mapperId: string;
        sqlId: string;
    }): Promise<any>;
    appendMapperSql(options: {
        entities: string | string[];
    }): Promise<void>;
}
