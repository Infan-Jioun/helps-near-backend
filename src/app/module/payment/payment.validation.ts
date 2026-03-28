import { z } from "zod";

const createPaymentSchema = z.object({
    emergencyId: z.string({ error: "Emergency ID is required" }),
    amount: z.number({ error: "Amount is required" }).min(1, "Amount must be at least 1"),
});

export const paymentValidation = {
    createPaymentSchema,
};