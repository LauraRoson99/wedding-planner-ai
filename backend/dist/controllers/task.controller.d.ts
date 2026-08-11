import type { Request, Response, NextFunction } from "express";
export declare function getTasks(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getTaskById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createTask(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createTasksBulk(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateTask(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteTask(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=task.controller.d.ts.map