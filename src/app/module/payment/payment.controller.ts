import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { sendResposne } from "../../../shared/sendResponse";
import status from "http-status";
import { paymentService } from "./payment.service";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await paymentService.createPaymentIntent(userId, req.body);
    sendResposne(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Payment intent created successfully",
        data: result,
    });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
    const { paymentIntentId } = req.params;
    const result = await paymentService.confirmPayment(paymentIntentId as string);
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Payment confirmed successfully",
        data: result,
    });
});

const stripeWebhook = async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    try {
        const result = await paymentService.stripeWebhook(req.body, signature);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await paymentService.getMyPayments(userId);
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Payments fetched successfully",
        data: result,
    });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
    const result = await paymentService.getAllPayments();
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "All payments fetched successfully",
        data: result,
    });
});

export const paymentController = {
    createPaymentIntent,
    confirmPayment,
    stripeWebhook,
    getMyPayments,
    getAllPayments,
};