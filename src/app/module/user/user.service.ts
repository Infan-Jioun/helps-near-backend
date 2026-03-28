import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import AppError from "../../errorHelper/appError";
import { prisma } from "../../lib/prisma";
import { ICreateVolunteerProfile, IUpdateMyProfile, IUpdateUserRole, IUpdateUserStatus, IUserFilterRequest, } from "./user.interface";
import { auth } from "../../lib/auth";

const createVolunteer = async (payload: ICreateVolunteerProfile) => {
    const { name, email, password, ...profileData } = payload;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new AppError(status.CONFLICT, "Email already exists");

    if (profileData.nidNumber) {
        const existingNid = await prisma.volunteerProfile.findUnique({
            where: { nidNumber: profileData.nidNumber },
        });
        if (existingNid) throw new AppError(status.CONFLICT, "NID number already registered");
    }

    const userData = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
            role: "VOLUNTEER",
        },
    });

    if (!userData || !userData.user) {
        throw new AppError(status.BAD_REQUEST, "Failed to create user");
    }
    try {
        const result = await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userData.user.id },
                data: {
                    role: "VOLUNTEER",
                    isVolunteer: true,
                    emailVerified: true,
                },
            });
            const volunteerProfile = await tx.volunteerProfile.create({
                data: {
                    userId: userData.user.id,
                    name,
                    email,
                    nidNumber: profileData.nidNumber ?? null,
                    skills: profileData.skills ?? [],
                    bio: profileData.bio ?? null,
                    latitude: profileData.latitude ?? null,
                    longitude: profileData.longitude ?? null,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            profileImage: true,
                            role: true,
                            isVolunteer: true,
                            emailVerified: true,
                            createdAt: true,
                        },
                    },
                },
            });

            return volunteerProfile;
        });

        return result;
    } catch (error) {
        console.log("Transaction error:", error);
        await prisma.user.delete({
            where: { id: userData.user.id },
        });
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create volunteer profile");
    }
};

const getAllUsers = async (filters: IUserFilterRequest) => {
    const { role, status, searchTerm, page = 1, limit = 10 } = filters;
    const skip = (Number(page) - 1) * Number(limit);

    const whereConditions: Prisma.UserWhereInput = {};

    if (role) whereConditions.role = role;
    if (status) whereConditions.status = status;
    if (searchTerm) {
        whereConditions.OR = [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
            { phone: { contains: searchTerm, mode: "insensitive" } },
        ];
    }

    const [data, total] = await Promise.all([
        prisma.user.findMany({
            where: whereConditions,
            skip,
            take: Number(limit),
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                isVolunteer: true,
                isAvailable: true,
                profileImage: true,
                bloodGroup: true,
                createdAt: true,
            },
        }),
        prisma.user.count({ where: whereConditions }),
    ]);

    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
        },
        data,
    };
};

const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            isVolunteer: true,
            isAvailable: true,
            profileImage: true,
            bloodGroup: true,
            latitude: true,
            longitude: true,
            createdAt: true,
            adminProfile: true,
            volunteerProfile: true,
            emergencies: {
                orderBy: { createdAt: "desc" },
                take: 5,
            },
        },
    });

    if (!user) throw new AppError(status.NOT_FOUND, "User not found");
    return user;
};

const updateUserRole = async (id: string, payload: IUpdateUserRole) => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError(status.NOT_FOUND, "User not found");

    return await prisma.user.update({
        where: { id },
        data: { role: payload.role },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
        },
    });
};

const updateUserStatus = async (id: string, payload: IUpdateUserStatus) => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError(status.NOT_FOUND, "User not found");

    return await prisma.user.update({
        where: { id },
        data: { status: payload.status },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
        },
    });
};



const updateMyProfile = async (userId: string, payload: IUpdateMyProfile) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(status.NOT_FOUND, "User not found");

    return await prisma.user.update({
        where: { id: userId },
        data: payload,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            profileImage: true,
            bloodGroup: true,
            latitude: true,
            longitude: true,
        },
    });
};

export const userService = {
    createVolunteer,
    getAllUsers,
    getUserById,
    updateUserRole,
    updateUserStatus,
    updateMyProfile,
};