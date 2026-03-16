import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { authService } from "./auth.service";
import { ICreateUserPayload } from "./auth.interface";

const createUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = authService.createUser(payload as ICreateUserPayload)
    }
    
)