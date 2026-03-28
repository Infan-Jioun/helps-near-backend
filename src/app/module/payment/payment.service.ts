import Stripe from "stripe";
import status from "http-status";
import AppError from "../../errorHelper/appError";
import { prisma } from "../../lib/prisma";
import { ICreatePayment } from "./payment.interface";
import { envConfig } from "../../../config/env";
import { stripe } from "../../../config/stripeConfig";



const createPaymentIntent = async (userId: string, payload: ICreatePayment) => {
    const emergency = await prisma.emergency.findUnique({
        where: { id: payload.emergencyId },
    });
    if (!emergency) throw new AppError(status.NOT_FOUND, "Emergency not found");
    if (emergency.userId !== userId) throw new AppError(status.FORBIDDEN, "You are not authorized");

    const existingPayment = await prisma.payment.findUnique({
        where: { emergencyId: payload.emergencyId },
    });
    if (existingPayment && existingPayment.status === "PAID") {
        throw new AppError(status.CONFLICT, "Payment already completed for this emergency");
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(payload.amount * 100),
        currency: "usd",
        metadata: {
            emergencyId: payload.emergencyId,
            userId,
        },
    });

    const payment = await prisma.payment.upsert({
        where: { emergencyId: payload.emergencyId },
        update: {
            amount: payload.amount,
            transactionId: paymentIntent.id,
            status: "PENDING",
        },
        create: {
            userId,
            emergencyId: payload.emergencyId,
            amount: payload.amount,
            currency: "USD",
            method: "STRIPE",
            transactionId: paymentIntent.id,
            status: "PENDING",
        },
    });

    return {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,
        amount: payload.amount,
        currency: "USD",
    };
};

const confirmPayment = async (paymentIntentId: string) => {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const payment = await prisma.payment.findFirst({
        where: { transactionId: paymentIntentId },
    });
    if (!payment) throw new AppError(status.NOT_FOUND, "Payment not found");

    if (paymentIntent.status === "succeeded") {
        return await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "PAID" },
        });
    } else if (paymentIntent.status === "canceled") {
        return await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED" },
        });
    }

    return payment;
};

const stripeWebhook = async (payload: Buffer, signature: string) => {
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            payload,
            signature,
            envConfig.STRIPE_WEBHOOK_SECRET as string
        );
    } catch {
        throw new AppError(status.BAD_REQUEST, "Invalid webhook signature");
    }

    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await prisma.payment.updateMany({
            where: { transactionId: paymentIntent.id },
            data: { status: "PAID" },
        });
    }

    if (event.type === "payment_intent.payment_failed") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await prisma.payment.updateMany({
            where: { transactionId: paymentIntent.id },
            data: { status: "FAILED" },
        });
    }

    return { received: true };
};

const getMyPayments = async (userId: string) => {
    return await prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
            emergency: {
                select: {
                    id: true,
                    type: true,
                    status: true,
                    address: true,
                    district: true,
                },
            },
        },
    });
};

const getAllPayments = async () => {
    return await prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: { id: true, name: true, email: true },
            },
            emergency: {
                select: { id: true, type: true, status: true, address: true },
            },
        },
    });
};

export const paymentService = {
    createPaymentIntent,
    confirmPayment,
    stripeWebhook,
    getMyPayments,
    getAllPayments,
};