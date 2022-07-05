import { helper } from "./helper";
export declare type SqlPool = Map<string | symbol, {
    sql: SqlMap;
    fragment: FragmentMap;
}>;
export declare type Node = {
    type: string;
    name: string;
    data: string;
    attribs: Record<string, string | undefined>;
    children: Array<Node>;
};
export declare type FragmentMap = Map<string, string>;
export declare type SqlMap = Map<string, (value: any, helperFn?: typeof helper) => string>;
export declare type QueryMap = Record<string, any>;
