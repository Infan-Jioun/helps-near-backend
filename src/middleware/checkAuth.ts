import { NextFunction, Request, Response } from "express";
import { cookieUtils } from "../app/utils/cookie";
import AppError from "../app/errorHelper/appError";
import status from "http-status";
import { prisma } from "../app/lib/prisma";
import { jwtUtils } from "../app/utils/jwt";
import { envConfig } from "../config/env";
import { Role, Status } from "../generated/prisma/client/enums";

// export const checkInternalSecret = (req: Request, res: Response, next: NextFunction) => {
//     const secret = req.headers["x-internal-secret"];
//     if (secret === process.env.INTERNAL_SECRET) {
//         return next(); 
//     }
//     return res.status(401).json({ message: "Unauthorized" });
// };

export const checkAuth = (...authRols: Role[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // ── Method 1: Better Auth session ──
            const sessionToken = cookieUtils.getCookie(req, "better-auth-session_token");
            if (sessionToken) {
                const sessionExists = await prisma.session.findFirst({
                    where: { token: sessionToken, expiresAt: { gt: new Date() } },
                    include: { user: true },
                });

                if (sessionExists?.user) {
                    const user = sessionExists.user;

                    if (user.status === Status.BLOCKED || user.status === Status.DELETED) {
                        throw new AppError(status.UNAUTHORIZED, "User is not active");
                    }
                    if (authRols.length > 0 && !authRols.includes(user.role as Role)) {
                        throw new AppError(status.FORBIDDEN, "Forbidden access!");
                    }

                    req.user = {
                        userId: user.id,
                        role: user.role as Role, // ✅
                        email: user.email,
                    };

                    return next(); // ✅ session valid হলে এখানেই শেষ
                }
            }

            // ── Method 2: JWT accessToken ──
            const accessToken =
                cookieUtils.getCookie(req, "accessToken") ??
                req.headers.authorization?.replace("Bearer ", "");

            if (!accessToken) {
                throw new AppError(status.UNAUTHORIZED, "No token provided");
            }

            const verifiedToken = jwtUtils.verifyToken(accessToken, envConfig.ACCESS_TOKEN_SECRET);
            if (!verifiedToken.success) {
                throw new AppError(status.UNAUTHORIZED, "Invalid access token");
            }

            if (authRols.length > 0 && !authRols.includes(verifiedToken.data!.role as Role)) {
                throw new AppError(status.FORBIDDEN, "Forbidden access!");
            }

            req.user = {
                userId: verifiedToken.data!.id,
                role: verifiedToken.data!.role as Role, // ✅
                email: verifiedToken.data!.email,
            };

            next();

        } catch (error) {
            next(error);
        }
    };