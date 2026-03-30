import { NextFunction, Request, Response } from "express";
import { cookieUtils } from "../app/utils/cookie";
import AppError from "../app/errorHelper/appError";
import status from "http-status";
import { prisma } from "../app/lib/prisma";
import { jwtUtils } from "../app/utils/jwt";
import { envConfig } from "../config/env";
import { Role, Status } from "../generated/prisma/client/enums";


export const checkAuth = (...authRols: Role[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {

        const sessionToken = cookieUtils.getCookie(req, "better-auth-session_token");
        if (!sessionToken) {
            throw new AppError(status.UNAUTHORIZED, "Unauthorzied access! No session token provided")
        }
        if (sessionToken) {
            const sessionExists = await prisma.session.findFirst({
                where: {
                    token: sessionToken,
                    expiresAt: {
                        gt: new Date()
                    }
                },
                include: {
                    user: true
                }
            })

            if (sessionExists && sessionExists.user) {
                const user = sessionExists.user;
                const now = new Date();
                const expiresAt = new Date(sessionExists.expiresAt)
                const createdAt = new Date(sessionExists.createdAt)
                const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
                const timeRemaning = expiresAt.getTime() - now.getTime();
                const percentRemaning = (timeRemaning / sessionLifeTime) * 100;
                if (percentRemaning < 20) {
                    res.setHeader("X-Session-Refresh", "true");
                    res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
                    res.setHeader("X-Time-Remaining", timeRemaning.toString())
                    console.log("Session Expiring soon!!");
                }
                if (user.status === Status.BLOCKED || user.status === Status.DELETED) {
                    throw new AppError(status.UNAUTHORIZED, "Unauthorzied access! User is not active")
                }

                if (authRols.length > 0 && !authRols.includes(user.role as Role)) {
                    throw new AppError(status.FORBIDDEN, "Forbidden access! You have not permission to access this resource.")
                }
                req.user = {
                    userId: user.id,
                    role: user.role,
                    email: user.email
                }

            }


            const accessToken = cookieUtils.getCookie(req, "accessToken");
            if (!accessToken) {
                throw new AppError(status.UNAUTHORIZED, "Unauthorzied access! No session token provided")
            }
            const verfiedToken = jwtUtils.verifyToken(accessToken, envConfig.ACCESS_TOKEN_SECRET);
            if (!verfiedToken.success) {
                throw new AppError(status.UNAUTHORIZED, "Unauthorzied access! invaild access token")
            }
            if (authRols.length > 0 && !authRols.includes(verfiedToken.data!.role as Role)) {
                throw new AppError(status.FORBIDDEN, "Forbidden access! You have not permission to access this resource.")
            }
            next();
        }

    } catch (error) {
        next(error)
    }
} 