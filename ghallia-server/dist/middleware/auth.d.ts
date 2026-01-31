/**
 * Authentication Middleware
 * Verifies JWT tokens for protected routes
 */
import { Request, Response, NextFunction } from 'express';
export declare const JWT_SECRET: string;
export declare const JWT_EXPIRES_IN = "7d";
export interface JWTPayload {
    userId: string;
    username: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function generateToken(payload: JWTPayload): string;
//# sourceMappingURL=auth.d.ts.map