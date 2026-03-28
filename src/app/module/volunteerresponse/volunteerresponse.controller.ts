import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { sendResposne } from "../../../shared/sendResponse";
import status from "http-status";
import { volunteerResponseService } from "./Volunteerresponse.service";



const acceptEmergency = catchAsync(async (req: Request, res: Response) => {
    const { emergencyId } = req.params;
    const volunteerId = req.user?.userId as string;
    const result = await volunteerResponseService.acceptEmergency(emergencyId as string, volunteerId, req.body);
    sendResposne(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Emergency accepted successfully",
        data: result,
    });
});

const getResponsesByEmergencyId = catchAsync(async (req: Request, res: Response) => {
    const { emergencyId } = req.params;
    const result = await volunteerResponseService.getResponsesByEmergencyId(emergencyId as string);
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Responses fetched successfully",
        data: result,
    });
});

const getMyResponses = catchAsync(async (req: Request, res: Response) => {
    const volunteerId = req.user?.userId as string;
    const result = await volunteerResponseService.getMyResponses(volunteerId);
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "My responses fetched successfully",
        data: result,
    });
});

const cancelResponse = catchAsync(async (req: Request, res: Response) => {
    const { emergencyId } = req.params;
    const volunteerId = req.user?.userId as string;
    const result = await volunteerResponseService.cancelResponse(emergencyId as string, volunteerId);
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: result.message,
        data: null,
    });
});

export const volunteerResponseController = {
    acceptEmergency,
    getResponsesByEmergencyId,
    getMyResponses,
    cancelResponse,
};