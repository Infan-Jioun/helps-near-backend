import { z } from "zod";
import { EmergencyStatus, EmergencyType } from "../../../generated/prisma/client/enums";

export const createEmergencySchema = z.object({
    type: z.nativeEnum(EmergencyType, {
        error: "Emergency type is required",
    }),
    description: z.string().max(1000).optional(),
    imageUrl: z.string().url("Invalid image URL").optional(),
    latitude: z.number({ error: "Latitude is required" }).min(-90).max(90),
    longitude: z.number({ error: "Longitude is required" }).min(-180).max(180),
    address: z.string().max(255).optional(),
    district: z.string().max(100).optional(),
    isPriority: z.boolean().optional().default(false),
});

export const updateEmergencySchema = z.object({
    status: z.nativeEnum(EmergencyStatus).optional(),
    description: z.string().max(1000).optional(),
    imageUrl: z.string().url("Invalid image URL").optional(),
    address: z.string().max(255).optional(),
    district: z.string().max(100).optional(),
    isPriority: z.boolean().optional(),
    resolvedAt: z.string().datetime().optional(),
});