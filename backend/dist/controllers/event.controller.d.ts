import type { Request, Response } from "express";
export declare function getEvents(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getEventById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createEvent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateEvent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteEvent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=event.controller.d.ts.map