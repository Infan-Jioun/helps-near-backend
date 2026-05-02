import { Request, Response, NextFunction } from "express";
import catchAsync from "../../../shared/catchAsync";
import { sendResposne } from "../../../shared/sendResponse";
import status from "http-status";
import { userService } from "./user.service";
import { IUserFilterRequest } from "./user.interface";

const createVolunteer = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await userService.createVolunteer(payload);
        sendResposne(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Volunteer Registered Successfully!",
            data: result
        })

    }
)
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const filters: IUserFilterRequest = {
        role: req.query.role as any,
        status: req.query.status as any,
        searchTerm: req.query.searchTerm as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
    };

    const result = await userService.getAllUsers(filters);

    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Users fetched successfully",
        data: result.data,
        // @ts-ignore
        meta: result.meta,
    });
});

const getAllLogs = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.getAllLogs();
    sendResposne(res, {
        httpStatusCode: status.OK,
        message: "Logs Succesfully fetched",
        data: result,
        success: true
    })
})

const getFrontendLogs = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.getFrontendLogs();
    sendResposne(res, {
        httpStatusCode: status.OK,
        message: "Frontend logs fetched successfully",
        data: result,
        success: true
    })
})

const saveFrontendLog = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.saveFrontendLog(req.body);
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Frontend log saved",
        data: result,
    });
});
const getUserById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await userService.getUserById(id as string);

    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User fetched successfully",
        data: result,
    });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await userService.updateUserRole(id as string, req.body);

    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User role updated successfully",
        data: result,
    });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await userService.updateUserStatus(id as string, req.body);

    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User status updated successfully",
        data: result,
    });
});




const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await userService.updateMyProfile(userId, req.body);

    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Profile updated successfully",
        data: result,
    });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await userService.deleteUser(id as string);
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Deleted user successfully",

        data: result
    });
});
export const userController = {
    createVolunteer,
    getAllUsers,
    getAllLogs,
    saveFrontendLog,
    getFrontendLogs,
    getUserById,
    updateUserRole,
    updateUserStatus,
    updateMyProfile,
    deleteUser
};