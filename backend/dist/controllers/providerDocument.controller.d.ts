import { Request, Response, NextFunction } from "express";
export declare function listDocuments(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function uploadDocument(req: Request, res: Response, next: NextFunction): void;
export declare function downloadDocument(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteDocument(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=providerDocument.controller.d.ts.map