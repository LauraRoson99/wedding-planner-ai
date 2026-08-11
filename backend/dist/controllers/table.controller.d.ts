import { Request, Response, NextFunction } from "express";
export declare function getTables(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getTablePeople(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getTable(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function postTable(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function putTable(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteTable(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function applySeating(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function assignSeat(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function clearSeat(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function clearTable(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=table.controller.d.ts.map