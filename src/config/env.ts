import status from "http-status"

import dotenv from "dotenv";
dotenv.config();
interface IEnvConfig {
    PORT: string
    NODE_ENV: string
    FRONTEND_URL: string
    BETTER_AUTH_URL: string
    BETTER_AUTH_SECRET: string
    DATABASE_URL: string
    EMAIL_SENDER_SMTP_USER: string
    EMAIL_SENDER_SMTP_PASS: string
    EMAIL_SENDER_SMTP_HOST: string
    EMAIL_SENDER_SMTP_PORT: string
    EMAIL_SENDER_SMTP_FROM: string
}
const loadEnvVaribales = (): IEnvConfig => {
    const requireEnvVariables = [
        "PORT",
        "NODE_ENV",
        "FRONTEND_URL",
        "BETTER_AUTH_URL",
        "BETTER_AUTH_SECRET",
        "DATABASE_URL",
        "EMAIL_SENDER_SMTP_USER",
        "EMAIL_SENDER_SMTP_PASS",
        "EMAIL_SENDER_SMTP_HOST",
        "EMAIL_SENDER_SMTP_PORT",
        "EMAIL_SENDER_SMTP_FROM"

    ]
    requireEnvVariables.forEach((variable) => {
        if (!process.env[variable]) {
            throw new Error(`Environment variable ${variable} is required but not set in .env file`)
        }
    })
    return {
        PORT: process.env.PORT as string,
        NODE_ENV: process.env.NODE_ENV as string,
        FRONTEND_URL: process.env.FRONTEND_URL as string,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
        DATABASE_URL: process.env.DATABASE_URL as string,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
        EMAIL_SENDER_SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER as string,
        EMAIL_SENDER_SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS as string,
        EMAIL_SENDER_SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST as string,
        EMAIL_SENDER_SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT as string,
        EMAIL_SENDER_SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM as string
    }
}
export const envConfig = loadEnvVaribales();