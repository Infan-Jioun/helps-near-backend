import { Request, Response } from "express"
import catchAsync from "../../../shared/catchAsync"
import { emargencyService } from "./emergency.service";
import { sendResposne } from "../../../shared/sendResponse";
import status from "http-status";
import { ICreateEmargency } from "./emergency.interface";
import { IRequestUser } from "../../interface/requestUserInterface";
const getMyEmargencies = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    const result = await emargencyService.getMyEmargencies(userId as string);

    sendResposne(res, {
        httpStatusCode: status.OK,
        message: "My emergencies fetched successfully",
        success: true,
        data: result,
    });
});
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
    const { type, status, district, isPriority, page, limit } = req.query;

    const result = await emargencyService.getAllEmargencies({
        type: type as string,
        status: status as string,
        district: district as string,
        isPriority: isPriority as string,
        page: Number(page) || 1,
        limit: Number(limit) || 9,
    });
    sendResposne(res, {
        httpStatusCode: 200,
        message: "Emergencies fetched successfully!",
        success: true,
        data: result.data,
        meta: {
            page: result.meta.page,
            limit: result.meta.limit,
            total: result.meta.total,
            totalPage: result.meta.totalPages
        },
    });

});

const getEmargencyById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const result = await emargencyService.getEmargencyById(id as string, userId as string, userRole as string);
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
    getMyEmargencies,
    createEmargency,
    getAllEmargencies,
    getEmargencyById,
    updateEmargency,
    deleteEmargency,
}