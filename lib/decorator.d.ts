export declare function SqlParam(id: string): (target: any, funName: string, index: number) => void;
export declare const Select: typeof Sql;
export declare const Insert: typeof Sql;
export declare const Update: typeof Sql;
export declare const Delete: typeof Sql;
export declare function Sql(sql: string): (target: any, funName: string, des: PropertyDescriptor) => void;
export declare function SqlMapper(mapperId: string, sqlId: string): (target: any, funName: string, des: PropertyDescriptor) => void;
