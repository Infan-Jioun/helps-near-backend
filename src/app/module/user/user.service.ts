import status from "http-status";

import AppError from "../../errorHelper/appError";
import { prisma } from "../../lib/prisma";
import { ICreateVolunteerProfile, IUpdateMyProfile, IUpdateUserRole, IUpdateUserStatus, IUserFilterRequest, } from "./user.interface";
import { auth } from "../../lib/auth";
import { Role } from "../../../generated/prisma/client/enums";
import { Prisma } from "../../../generated/prisma/client/client";
import path from "path";
import fs from "fs/promises";
const logDir = path.resolve(process.cwd(), "logs");

const ensureLogDir = async () => {
    await fs.mkdir(logDir, { recursive: true });
};
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
            role: Role.VOLUNTEER
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
                    fee: profileData.fee ?? null,
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
const getAllLogs = async () => {
    const accessLogPath = path.join(logDir, "access.log");
    const frontendLogPath = path.join(logDir, "frontend.log");

    let backendLogs: object[] = [];
    try {
        const raw = await fs.readFile(accessLogPath, "utf-8");
        backendLogs = raw
            .trim()
            .split("\n")
            .filter(Boolean)
            .map((line) => ({ ...JSON.parse(line), source: "backend" }));
    } catch (err: any) {
        if (err.code !== "ENOENT") throw err;
    }


    let frontendLogs: object[] = [];
    try {
        const raw = await fs.readFile(frontendLogPath, "utf-8");
        frontendLogs = raw
            .trim()
            .split("\n")
            .filter(Boolean)
            .map((line) => ({ ...JSON.parse(line), source: "frontend" }));
    } catch (err: any) {
        if (err.code !== "ENOENT") throw err;
    }


    const allLogs = [...backendLogs, ...frontendLogs].sort(
        (a: any, b: any) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return allLogs;
};
const saveFrontendLog = async (logData: any) => {
    const logPath = path.join(logDir, "frontend.log");
    const safeLog = {
        timestamp: logData.timestamp,
        method: logData.method,
        path: logData.path,
        userAgent: logData.userAgent,
        ip: logData.ip,
        userId: logData.userId,
        role: logData.role,
    };
    await fs.appendFile(logPath, JSON.stringify(safeLog) + "\n", "utf-8");
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
const deleteUser = async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(status.NOT_FOUND, "User not found");

    await prisma.$transaction(async (tx) => {
        if (user.isVolunteer) {
            await tx.volunteerProfile.delete({ where: { userId } });
        }
        await tx.user.delete({ where: { id: userId } });
    });

    return { message: "User deleted successfully" };
};



export const userService = {
    createVolunteer,
    getAllUsers,
    getAllLogs,
   saveFrontendLog,
    getUserById,
    updateUserRole,
    updateUserStatus,
    updateMyProfile,
    deleteUser
};


