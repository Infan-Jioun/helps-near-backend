import express, { Router } from "express";

import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";
import { paymentValidation } from "./payment.validation";

const router = express.Router();


router.post("/webhook", express.raw({ type: "application/json" }),
    paymentController.stripeWebhook
);

router.post(
    "/create-intent",
    checkAuth(Role.USER, Role.VOLUNTEER, Role.ADMIN),
    validateRequest(paymentValidation.createPaymentSchema),
    paymentController.createPaymentIntent
);

router.get(
    "/confirm/:paymentIntentId",
    checkAuth(Role.USER, Role.VOLUNTEER, Role.ADMIN),
    paymentController.confirmPayment
);

router.get(
    "/my",
    checkAuth(Role.USER, Role.VOLUNTEER, Role.ADMIN),
    paymentController.getMyPayments
);

router.get(
    "/",
    checkAuth(Role.ADMIN),
    paymentController.getAllPayments
);

export const paymentRouter: Router = router;