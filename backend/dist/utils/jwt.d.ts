import { JwtPayload } from "jsonwebtoken";
export declare const signAccess: (payload: object) => string;
export declare const signRefresh: (payload: object) => string;
export declare const verifyAccess: (token: string) => JwtPayload | string;
export declare const verifyRefresh: (token: string) => JwtPayload | string;
//# sourceMappingURL=jwt.d.ts.map