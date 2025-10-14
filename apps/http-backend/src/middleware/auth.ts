import { NextFunction, Request, Response } from "express";
import pkg from 'jsonwebtoken';
import { logger } from "../utils/logger.js";
const { verify, JsonWebTokenError, TokenExpiredError } = pkg;

export interface extendedRequest extends Request {
    userId?: string
}

interface myJsonPayload extends pkg.JwtPayload {
    id: string
}

export const auth = (req: extendedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing"
            });
        }

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : authHeader;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "token is not provided"
            });
        }

        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in environment variables");

        const decodedToken = verify(token, JWT_SECRET) as myJsonPayload;

        if (!decodedToken.id) {
            logger.info("auth", "auth", "Invalid token provided", token);
            return res.status(401).json({
                success: false,
                message: "Token is invalid: missing user id",
            });
        }

        req.userId = decodedToken.id;
        next();
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: "Token has expired",
            });
        }
        if (error instanceof JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}