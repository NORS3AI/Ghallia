"use strict";
/**
 * Authentication Middleware
 * Verifies JWT tokens for protected routes
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_EXPIRES_IN = exports.JWT_SECRET = void 0;
exports.authMiddleware = authMiddleware;
exports.generateToken = generateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Secret key for JWT (in production, use environment variable)
exports.JWT_SECRET = process.env.JWT_SECRET || 'infinity-game-secret-key-2026';
exports.JWT_EXPIRES_IN = '7d';
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Invalid authorization format' });
    }
    const token = parts[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, exports.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
}
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, exports.JWT_SECRET, { expiresIn: exports.JWT_EXPIRES_IN });
}
//# sourceMappingURL=auth.js.map