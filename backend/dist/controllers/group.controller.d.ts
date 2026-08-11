import { Request, Response, NextFunction } from "express";
export declare function getGroups(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getGroup(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function postGroup(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function patchGroup(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function removeGroup(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=group.controller.d.ts.map