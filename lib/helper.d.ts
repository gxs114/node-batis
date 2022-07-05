import * as sqlstring from "sqlstring";
declare function __sql_where(sql: string): string;
export declare const helper: {
    __sql_where: typeof __sql_where;
    __sql_escape: typeof sqlstring.escape;
};
export declare const isPlainObject: (value: unknown) => boolean;
export {};
