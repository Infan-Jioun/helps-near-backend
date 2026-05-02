import { betterAuth } from "better-auth";
import { envConfig } from "../../config/env";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP, oAuthProxy } from "better-auth/plugins";
import { sendEmail } from "../utils/email";
import { prisma } from "./prisma";
import { Role } from "../../generated/prisma/client/enums";


export const auth = betterAuth({
    baseURL: envConfig.BETTER_AUTH_URL! || "https://helps-near-backend-blond.vercel.app",
    secret: envConfig.BETTER_AUTH_SECRET!,
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            redirectURI: `${envConfig.BETTER_AUTH_URL}/api/auth/callback/google`,
        },
    },
  
   
    trustedOrigins: [process.env.FRONTEND_URL! || "https://helps-near-frontend.vercel.app", process.env.BETTER_AUTH_URL! || "https://helps-near-backend-blond.vercel.app"],

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true

    },
    emailVerification: {
        sendOnSignIn: true,
        sendOnSignUp: true,
        autoSignInAfterVerification: true
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: Role.USER
            }
        }
    },
    plugins: [
        bearer(),
        emailOTP({
            overrideDefaultEmailVerification: true,
            async sendVerificationOTP({ email, otp, type }) {
                if (type === "email-verification") {
                    const user = await prisma.user.findUnique({
                        where: {
                            email
                        }
                    })
                    if (user && !user.emailVerified) {
                        await sendEmail({
                            to: email,
                            subject: "Verify your email",
                            templateName: "otp",
                            templateData: {
                                name: user.name,
                                otp
                            },
                            attachments: []
                        })

                    }
                }
            },
            expiresIn: 10 * 60,
            otpLength: 6
        }),
        oAuthProxy()
    ],

    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24,
        }
    },
    // advanced: {
    //     cookiePrefix: "better-auth",
    //     useSecureCookies: envConfig.NODE_ENV === "production",
    //     crossSubDomainCookies: {
    //         enabled: false,
    //     },
    //     disableCSRFCheck: true,
    //     cookies: {
    //         state: {
    //             attributes: {
    //                 sameSite: "none",
    //                 secure: true,
    //                 httpOnly: true,
    //                  partitioned: true,
    //             },


    //         }, sessionToken: {
    //             attributes: {
    //                 sameSite: "none",
    //                 secure: true,
    //                 httpOnly: true,
    //                 partitioned: true,
    //             }
    //         }
    //     }
    // }
    advanced: {
        cookies: {
            session_token: {
                name: "better-auth-session_token", // Force this exact name
                attributes: {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    // partitioned: true,
                },
            },
            state: {
                name: "session_token_better", // Force this exact name
                attributes: {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    // partitioned: true,
                },
            },
        },
    },


});