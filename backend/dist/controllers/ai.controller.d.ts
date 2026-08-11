import { Request, Response, NextFunction } from "express";
/** Lets the frontend show/hide AI features without exposing the key. */
export declare function getAiStatus(_req: Request, res: Response): Promise<void>;
export declare function suggestTasks(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function suggestBudget(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function suggestSeating(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=ai.controller.d.ts.map