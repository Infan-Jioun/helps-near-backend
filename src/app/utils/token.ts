import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envConfig } from "../../config/env";
import { cookieUtils } from "./cookie";
import { Response } from "express";
const getAccessToken = (payload: JwtPayload) => {
    const accessToken = jwtUtils.createToken(
        payload, envConfig.ACCESS_TOKEN_SECRET, {
            expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN
        } as SignOptions
    )
    return accessToken
}
const getRefreshToken = (payload: JwtPayload) => {
    const refreshToken = jwtUtils.createToken(
        payload, envConfig.REFRESH_TOKEN_SECRET, {
            expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN
        } as SignOptions
    )
    return refreshToken
}
const setAccessTokenCookie = (res: Response, token: string) => {
    cookieUtils.setCookie(res, "accessToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 60 * 24 * 1000

    })
}
const setRefreshTokenCookie = (res: Response, token: string) => {
    cookieUtils.setCookie(res, "refreshToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        maxAge: 60 * 60 * 60 * 24 * 1000 * 7
    })
}
const setBetterAuthSessionCookie = (res: Response, token: string) => {
    cookieUtils.setCookie(res, "better-auth-session_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        maxAge: 60 * 60 * 60 * 24
    })
}
export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    setBetterAuthSessionCookie


}