import { NextFunction, Request, Response } from "express";
import z from "zod";
import status from "http-status";
import { envConfig } from "../config/env";
import { handelZodError } from "../app/errorHelper/handelZodError";
import AppError from "../app/errorHelper/appError";
import { TErrorResponce, TErrorSource } from "../app/interface/errror.interface";
import { Prisma } from "../generated/prisma/client";

export const globalErrorHandlar = async (err: any, req: Request, res: Response, next: NextFunction) => {
    if (envConfig.NODE_ENV === "development") {
        console.log("Error from global error Handler", err);
    }

    let errorSource: TErrorSource[] = [];
    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message: string = "Internal server error";
    let stack: string | undefined;

    if (err instanceof z.ZodError) {
        const simplifiedError = handelZodError(err);
        statusCode = simplifiedError.statusCode as number;
        message = simplifiedError.message;
        errorSource = [...(simplifiedError.errorSource ?? [])];
        stack = err.stack;

    } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        stack = err.stack;
        errorSource = [{ path: "", message: err.message }];

    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002":
                statusCode = status.CONFLICT;
                message = "Already exists";
                errorSource = [{
                    path: (err.meta?.target as string[])?.join(", ") ?? "",
                    message: `Duplicate value on field: ${(err.meta?.target as string[])?.join(", ")}`,
                }];
                break;
            case "P2025":
                statusCode = status.NOT_FOUND;
                message = "Record not found";
                errorSource = [{ path: "", message: "The requested record does not exist" }];
                break;
            case "P2003":
                statusCode = status.BAD_REQUEST;
                message = "Invalid reference";
                errorSource = [{ path: "", message: "Related record not found" }];
                break;
            case "P2014":
                statusCode = status.BAD_REQUEST;
                message = "Invalid relation";
                errorSource = [{ path: "", message: "The relation constraint would be violated" }];
                break;
            default:
                statusCode = status.INTERNAL_SERVER_ERROR;
                message = "Database error";
                errorSource = [{ path: "", message: err.message }];
        }
        stack = err.stack;

    } else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = status.BAD_REQUEST;
        message = "Invalid data provided";
        errorSource = [{ path: "", message: "Validation failed on database query" }];
        stack = err.stack;

    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        statusCode = status.SERVICE_UNAVAILABLE;
        message = "Database connection failed";
        errorSource = [{ path: "", message: "Could not connect to the database" }];
        stack = err.stack;

    } else if (err instanceof Error) {
        statusCode = status.INTERNAL_SERVER_ERROR;
        message = err.message;
        stack = err.stack;
        errorSource = [{ path: "", message: err.message }];
    }

    const errorResponse: TErrorResponce = {
        success: false,
        message,
        errorSource,
        error: envConfig.NODE_ENV === "development" ? err : undefined,
        stack: envConfig.NODE_ENV === "development" ? stack : undefined,
    };

    res.status(statusCode).json(errorResponse);
};