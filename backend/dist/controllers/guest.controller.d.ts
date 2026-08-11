import { Request, Response, NextFunction } from "express";
export declare function getGuests(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getGuest(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function postGuest(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function putGuest(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteGuest(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function importGuests(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function assignGuestsToGroup(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function bulkDeleteGuests(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function markInvitationsSent(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function markInvitationsNotSent(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getRsvpLink(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function sendInvitations(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=guest.controller.d.ts.map