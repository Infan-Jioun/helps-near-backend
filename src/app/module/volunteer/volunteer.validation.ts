import { z } from "zod";
import { VolunteerSkill } from "../../../generated/prisma/enums";



export const updateVolunteerProfileSchema = z.object({
    nidNumber: z.string().min(10).max(17).optional(),
    skills: z.array(z.nativeEnum(VolunteerSkill)).optional(),
    bio: z.string().max(500).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    isAvailable: z.boolean().optional(),
});

export const volunteerValidation = {
    updateVolunteerProfileSchema,
};
