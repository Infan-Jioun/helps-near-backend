import { z } from "zod";
import { Role, Status, BloodGroup, VolunteerSkill } from "../../../generated/prisma/client/enums";
export const createVolunteerProfileSchema = z.object({
    name: z.string().min(2).max(100, { error: "Name is required" }),
    email: z.string().email({ error: "Valid email required" }),
    password: z.string().min(6, { error: "Password min 6 characters" }),
    nidNumber: z.string().min(10).max(17).optional(),
    skills: z.array(z.nativeEnum(VolunteerSkill)).optional(),
    bio: z.string().max(500).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
});
export const updateUserRoleSchema = z.object({
    role: z.nativeEnum(Role, { error: "Invalid role" }),
});

export const updateUserStatusSchema = z.object({
    status: z.nativeEnum(Status, { error: "Invalid status" }),
});

export const updateMyProfileSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().min(10).max(15).optional(),
    profileImage: z.string().url("Invalid image URL").optional(),
    bloodGroup: z.nativeEnum(BloodGroup).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
});

export const UserValidation = {
    createVolunteerProfileSchema,
    updateUserRoleSchema,
    updateUserStatusSchema,
    updateMyProfileSchema,
};