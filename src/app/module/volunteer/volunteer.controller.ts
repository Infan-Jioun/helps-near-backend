import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { sendResposne } from "../../../shared/sendResponse";
import status from "http-status";
import { volunteerService } from "./volunteer.service";
import { IVolunteerFilterRequest } from "./volunteer.interface";
const getAllVolunteers = catchAsync(async (req: Request, res: Response) => {
    const filters: IVolunteerFilterRequest = {
        isVerified: req.query.isVerified === "true" ? true : req.query.isVerified === "false" ? false : undefined,
        isAvailable: req.query.isAvailable === "true" ? true : req.query.isAvailable === "false" ? false : undefined,
        skills: req.query.skills as any,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
    };
    const result = await volunteerService.getAllVolunteers(filters);
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Volunteers fetched successfully",
        data: result.data,
        // @ts-ignore
        meta: result.meta,
    });
});
const getVolunteerById = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await volunteerService.getVolunteerById(userId as string);
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Volunteer fetched successfully",
        data: result,
    });
});

const getMyVolunteerProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await volunteerService.getMyVolunteerProfile(userId);
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "My volunteer profile fetched successfully",
        data: result,
    });
});

const updateMyVolunteerProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await volunteerService.updateMyVolunteerProfile(userId, req.body);
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Volunteer profile updated successfully",
        data: result,
    });
});

const verifyVolunteer = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await volunteerService.verifyVolunteer(userId as string);
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Volunteer verified successfully",
        data: result,
    });
});

const deleteVolunteer = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await volunteerService.deleteVolunteer(userId as string);
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: result.message,
        data: null,
    });
});

export const volunteerController = {
    getAllVolunteers,
    getVolunteerById,
    getMyVolunteerProfile,
    updateMyVolunteerProfile,
    verifyVolunteer,
    deleteVolunteer,
};