
import { NextFunction, Request, Response } from "express";
import z from "zod";
import status from "http-status";
import { envConfig } from "../config/env";
import { handelZodError } from "../app/errorHelper/handelZodError";
import AppError from "../app/errorHelper/appError";
import { TErrorResponce, TErrorSource } from "../app/interface/errro.interface";



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