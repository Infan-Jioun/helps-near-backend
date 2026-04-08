import status from "http-status";
import { auth } from "../../lib/auth";
import { ICreateUserPayload, ILoginUserPayload } from "./auth.interface"
import AppError from "../../errorHelper/appError";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { jwtUtils } from "../../utils/jwt";
import { envConfig } from "../../../config/env";
import { JwtPayload } from "jsonwebtoken";
const createUser = async (payload: ICreateUserPayload) => {
    const { email, name, password } = payload;

    const data = await auth.api.signUpEmail({
        body: { name, email, password }
    });

    if (!data.user) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create user!");
    }

    try {
        const user = await prisma.user.update({
            where: { id: data.user.id },
            data: {
                email: payload.email,
                name: payload.name
            }
        });


        // const accessToken = tokenUtils.getAccessToken({
        //     id: data.user.id,
        //     email: data.user.email,
        //     role: data.user.role,
        //     emailVerified: data.user.emailVerified
        // });

        // const refreshToken = tokenUtils.getRefreshToken({
        //     id: data.user.id,
        //     email: data.user.email,
        //     role: data.user.role,
        //     emailVerfied: data.user.emailVerified
        // });

        return {
            ...data,
            // accessToken,
            // refreshToken,
            user
        };

    } catch (error) {
        console.log("Transaction error", error);
        await prisma.user.delete({
            where: { id: data.user.id }
        });
        throw error;
    }
};
const loginUser = async (paylaod: ILoginUserPayload) => {
    const { email, password } = paylaod;
    const data = await auth.api.signInEmail({
        body: {
            email, password
        }
    })
    console.log(data)
    if (!data.user) {
        throw new AppError(status.UNAUTHORIZED, "You are not User")
    }
    const accessToken = tokenUtils.getAccessToken({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        emailVerified: data.user.emailVerified
    })
    const refreshToken = tokenUtils.getRefreshToken({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        emailVerfied: data.user.emailVerified
    })
    return {
        ...data,
        accessToken,
        refreshToken,

    }

}
const getMyProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            isVolunteer: true,
            isAvailable: true,
            profileImage: true,
            bloodGroup: true,
            latitude: true,
            longitude: true,
            createdAt: true,
            volunteerProfile: true,
            adminProfile: true,
        },
    });

    if (!user) throw new AppError(status.NOT_FOUND, "User not found");
    return user;
};

const verifyEmail = async (otp: string, email: string) => {
    try {
        const result = await auth.api.verifyEmailOTP({
            body: { email, otp }
        });
        if (!result || !result.status) {
            throw new AppError(status.BAD_REQUEST, "Invalid or expired OTP");
        }

        if (!result.user) {
            throw new AppError(status.NOT_FOUND, "User not found");
        }
        if (!result.user.emailVerified) {
            await prisma.user.update({
                where: { id: result.user.id },
                data: { emailVerified: true }
            });
        }

        return result;

    } catch (error: any) {
        console.error("VERIFY OTP ERROR:", error);

        throw new AppError(
            status.BAD_REQUEST,
            error?.message || "Failed to verify email"
        );
    }
};
const resendOtp = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    if (user.emailVerified) {
        throw new AppError(status.BAD_REQUEST, "Email already verified");
    }
    const result = await auth.api.sendVerificationOTP({
        body: {
            email,
            type: "email-verification"
        }
    });

    return result;
};

const logout = async (sessionToken: string) => {
    const result = await auth.api.signOut({
        headers: {
            cookie: `better-auth-session_token=${sessionToken}`
        }
    });
    return result;
};
const getNewToken = async (refreshToken: string, sessionToken: string) => {
    console.log("refresh-token", refreshToken);
    console.log("session-token", sessionToken);
    const isSessionTokenExists = await prisma.session.findUnique({
        where: {
            token: sessionToken,
        },
        include: {
            user: true
        }
    })
    if (!isSessionTokenExists) {
        throw new AppError(status.UNAUTHORIZED, "Invaild session user!")
    }
    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, envConfig.REFRESH_TOKEN_SECRET);
    if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
        throw new AppError(status.UNAUTHORIZED, "Invalid refresh token!")
    }
    const data = verifiedRefreshToken.data as JwtPayload;
    console.log(data);
    const newAccessToken = tokenUtils.getAccessToken({
        id: data.id,
        email: data.email,
        role: data.role,
        emailVerified: data.emailVerified
    })
    const newRefreshToken = tokenUtils.getRefreshToken({
        id: data.id,
        email: data.email,
        role: data.role,
        emailVerified: data.emailVerified
    })
    const updateSession = await prisma.session.update({

        where: {
            token: sessionToken
        }, data: {
            token: sessionToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
        }
    })

    return {
        newAccessToken,
        newRefreshToken,
        sessionToken: updateSession.token
    }
}
const googleLoginSuccess = async (session: Record<string, any>) => {
    const isPatientExists = await prisma.user.findUnique({
        where: {
            id: session.id
        }
    })
    if (!isPatientExists) {
        await prisma.user.create({
            data: {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email
            }
        })
    }
    // ! access token and refresh token create
    const accessToken = tokenUtils.getAccessToken({
        id: session.user.id,
        role: session.user.role,
        name: session.user.name,
    })
    const refreshToken = tokenUtils.getRefreshToken({
        id: session.user.id,
        role: session.user.role,
        name: session.user.name
    })
    return {
        accessToken,
        refreshToken
    }
}
export const authService = {
    createUser,
    loginUser,
    getMyProfile,
    verifyEmail,
    resendOtp,
    logout,
    getNewToken,
    googleLoginSuccess
}