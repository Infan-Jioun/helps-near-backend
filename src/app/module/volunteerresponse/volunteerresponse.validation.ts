import { z } from "zod";

const createVolunteerResponseSchema = z.object({
    estimatedArrivalMin: z.number().min(1).max(120).optional(),
});

export const volunteerResponseValidation = {
    createVolunteerResponseSchema,
};