import { Request, Response, NextFunction } from 'express';
export declare function postRegister(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function postLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function postRefresh(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function postLogout(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function postForgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function postResetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function postChangePassword(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getMe(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function patchProfile(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.controller.d.ts.map