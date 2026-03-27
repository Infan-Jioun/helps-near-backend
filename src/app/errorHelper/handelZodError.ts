import status from "http-status";
import z from "zod";
import { TErrorResponce, TErrorSource } from "../interface/errro.interface";


export const handelZodError = (err: z.ZodError): TErrorResponce => {
    const statusCode = status.BAD_REQUEST;
    const message = "Zod Validation Error";
    const errorSource: TErrorSource[] = []
    err.issues.forEach(issue => {
        errorSource.push({
            path: issue.path.join(" => ") || "unknown",
            message: issue.message
        })
    })
    return {
        success: false,
        message,
        errorSource,
        statusCode
    }
}