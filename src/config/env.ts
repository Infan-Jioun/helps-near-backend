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
}
const loadEnvVaribales = (): IEnvConfig => {
    const requireEnvVariables = [
        "PORT",
        "NODE_ENV",
        "FRONTEND_URL",
        "BETTER_AUTH_URL",
        "BETTER_AUTH_SECRET",
        "DATABASE_URL"

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
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string
    }
}
export const envConfig = loadEnvVaribales();