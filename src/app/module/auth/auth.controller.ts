import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { authService } from "./auth.service";
import { ICreateUserPayload, ILoginUserPayload } from "./auth.interface";
import { sendResposne } from "../../../shared/sendResponse";
import status from "http-status";

const createUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await authService.createUser(payload as ICreateUserPayload);
        console.log(result)
        sendResposne(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Successfully user created!",
            data: result
        })
    }

)
const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await authService.loginUser(payload as ILoginUserPayload);
        console.log(result)
        sendResposne(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Successfully user login!",
            data: result
        })
    }

)
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
export const authController = {
    createUser,
    loginUser,
    verifyEmail
}