import { betterAuth } from "better-auth";
import { envConfig } from "../../config/env";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
    baseURL: envConfig.BETTER_AUTH_URL,
    secret: envConfig.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
    }
});