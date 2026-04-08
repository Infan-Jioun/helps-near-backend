import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { authService } from "./auth.service";
import { ICreateUserPayload, ILoginUserPayload } from "./auth.interface";
import { sendResposne } from "../../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelper/appError";
import { cookieUtils } from "../../utils/cookie";
import { auth } from "../../lib/auth";
import { envConfig } from "../../../config/env";

const createUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        console.log("User info", payload)
        const result = await authService.createUser(payload as ICreateUserPayload);
        // const { accessToken, refreshToken, token, ...rest } = result;

        // tokenUtils.setAccessTokenCookie(res, accessToken)
        // tokenUtils.setRefreshTokenCookie(res, refreshToken)
        // tokenUtils.setRefreshTokenCookie(res, refreshToken)
        // tokenUtils.setBetterAuthSessionCookie(res, token as string)
        console.log(result)
        sendResposne(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Successfully user created!",
            // data: {
            //     accessToken,
            //     refreshToken,
            //     ...rest
            // }
            data: result
        })
    }

)
const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await authService.loginUser(payload as ILoginUserPayload);
        const { accessToken, refreshToken, token, ...rest } = result;
        tokenUtils.setAccessTokenCookie(res, accessToken)
        tokenUtils.setRefreshTokenCookie(res, refreshToken)
        tokenUtils.setBetterAuthSessionCookie(res, token as string)
        console.log(result)
        sendResposne(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Successfully user login!",
            data: {
                accessToken,
                refreshToken,
                ...rest
            }
        })
    }

)
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const result = await authService.getMyProfile(userId as string);

    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Profile fetched successfully",
        data: result,
    });
});
const verifyEmail = catchAsync(
    async (req: Request, res: Response) => {
        const { otp, email } = req.body;
        const result = await authService.verifyEmail(otp, email);
        sendResposne(res, {
            httpStatusCode: status.OK,
            success: true,
            message: `Successfully email verfied ${email}`,
            data: result
        })
    }
)
const resendOtp = catchAsync(
    async (req: Request, res: Response) => {
        const { email } = req.body;
        const result = await authService.resendOtp(email);
        sendResposne(res, {
            httpStatusCode: status.OK,
            success: true,
            message: `Successfully OTP sent to ${email}`,
            data: result
        })
    }
)
const logout = catchAsync(
    async (req: Request, res: Response) => {
        const betterAuthSessionToken = req.cookies["better-auth-session_token"];
        if (!betterAuthSessionToken) {
            throw new AppError(status.UNAUTHORIZED, "Already logged out!");
        }
        const result = await authService.logout(betterAuthSessionToken)
        cookieUtils.clearCookie(res, "accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",

        })
        cookieUtils.clearCookie(res, "refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })
        cookieUtils.clearCookie(res, "better-auth-session_token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })
        sendResposne(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Logout successfully",
            data: result
        })
    }

)
const getNewToken = catchAsync(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        const betterAuthSessionToken = req.cookies["better-auth-session_token"];
        if (!refreshToken) {
            throw new AppError(status.UNAUTHORIZED, "Refesh is missing");

        }
        const result = await authService.getNewToken(refreshToken, betterAuthSessionToken);
        const { newAccessToken, newRefreshToken, sessionToken } = result;
        tokenUtils.setAccessTokenCookie(res, newAccessToken);
        tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, sessionToken);
        sendResposne(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "New token genarated successfully",
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                sessionToken
            }
        })
    }
)
const googleLogin = catchAsync((req: Request, res: Response) => {
    const redirectPath = req.query.redirect || "/dashboard";
    const encodedRedirectPath = encodeURIComponent(redirectPath as string);
    const callbackURL = `${envConfig.BETTER_AUTH_URL}/api/v1/auth/login/google/success?redirect=${encodedRedirectPath}}`;
    res.render("googleRedirect", {
        callbackURL: callbackURL,
        betterAuthUrl: envConfig.BETTER_AUTH_URL

    })

})
const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = req.query.redirect as string || "/dashboard";
    const sessionToken = req.cookies["better-auth-session_token"];

    if (!sessionToken) return res.redirect(`${envConfig.FRONTEND_URL}/login?error=oauth_failed`);

    const session = await auth.api.getSession({
        headers: { "Cookie": `better-auth-session_token=${sessionToken}` }
    });

    if (!session?.user) return res.redirect(`${envConfig.FRONTEND_URL}/login?error=no_user_found`);

    const { accessToken, refreshToken } = await authService.googleLoginSuccess(session);

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);

    const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
    const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

    res.redirect(`${envConfig.FRONTEND_URL}${finalRedirectPath}`);
});
const handelAuthError = catchAsync((req: Request, res: Response) => {
    const error = req.query.error as string || "oauth_failed";
    res.redirect(`${envConfig.FRONTEND_URL}/login?error=${error}`)
})
export const authController = {
    createUser,
    loginUser,
    getMyProfile,
    verifyEmail,
    resendOtp,
    logout,
    getNewToken,
    googleLoginSuccess,
    googleLogin,
    handelAuthError
}