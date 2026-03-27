import { Request, Response } from "express"
import catchAsync from "../../../shared/catchAsync"
import { emargencyService } from "./emergency.service";
import { sendResposne } from "../../../shared/sendResponse";
import status from "http-status";
import { ICreateEmargency } from "./emergency.interface";

const createEmargency = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        const payload = req.body;
        const result = await emargencyService.createEmargency(userId as string, payload as ICreateEmargency);
        sendResposne(res, {
            httpStatusCode: status.CREATED,
            message: "Successfully Create Emargency!",
            success: true,
            data: result
        })
    }
)
const getAllEmargencies = catchAsync(async (req: Request, res: Response) => {
    const result = await emargencyService.getAllEmargencies();
    sendResposne(res, {
        httpStatusCode: status.OK,
        message: "Emergencies fetched successfully!",
        success: true,
        data: result,
    });
});

const getEmargencyById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await emargencyService.getEmargencyById(id as string);
    sendResposne(res, {
        httpStatusCode: status.OK,
        message: "Emergency fetched successfully",
        success: true,
        data: result,
    });
});

const updateEmargency = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role as string;
    const result = await emargencyService.updateEmargency(id as string, userId, userRole, req.body);
    sendResposne(res, {
        httpStatusCode: status.OK,
        message: "Emergency updated successfully",
        success: true,
        data: result,
    });
});

const deleteEmargency = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role as string;
    const result = await emargencyService.deleteEmargency(id as string, userId, userRole);
    sendResposne(res, {
        httpStatusCode: status.OK,
        message: "Emergency deleted successfully",
        success: true,
        data: result,
    });
});


export const emargencyController = {
    createEmargency,

    getAllEmargencies,
    getEmargencyById,
    updateEmargency,
    deleteEmargency,
}