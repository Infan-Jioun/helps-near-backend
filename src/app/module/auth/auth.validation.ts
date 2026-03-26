import { z } from "zod";

export const registerUserZodSchema = z.object({

    name: z
        .string({ message: "Name is required" })
        .min(2, "Name must be at least 2 characters")
        .max(30, "Name must be at most 30 characters"),

    email: z
        .string({ message: "Email is required" })
        .email("Invalid email address"),

    password: z
        .string({ message: "Password is required" })
        .min(6, "Password must be at least 6 characters")
        .max(20, "Password must be at most 20 characters"),

    phone: z
        .string()
        .regex(/^01[3-9]\d{8}$/, "Invalid Bangladeshi phone number")
        .optional(),

    bloodGroup: z
        .enum([
            "A_POSITIVE",
            "A_NEGATIVE",
            "B_POSITIVE",
            "B_NEGATIVE",
            "AB_POSITIVE",
            "AB_NEGATIVE",
            "O_POSITIVE",
            "O_NEGATIVE",
        ], { message: "Invalid blood group" })
        .optional(),
})


export const loginUserZodSchema = z.object({

    email: z
        .string({ message: "Email is required" })
        .email("Invalid email address"),

    password: z
        .string({ message: "Password is required" })
        .min(6, "Password must be at least 6 characters")
        .max(20, "Password must be at most 20 characters"),
})


