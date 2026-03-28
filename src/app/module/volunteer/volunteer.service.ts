import status from "http-status";
import AppError from "../../errorHelper/appError";
import { prisma } from "../../lib/prisma";
import { IUpdateVolunteerProfile, IVolunteerFilterRequest } from "./volunteer.interface";



const getAllVolunteers = async (filters: IVolunteerFilterRequest) => {
    const { isVerified, isAvailable, skills, page = 1, limit = 10 } = filters;
    const skip = (Number(page) - 1) * Number(limit);

    const whereConditions: any = {};
    if (isVerified !== undefined) whereConditions.isVerified = isVerified;
    if (isAvailable !== undefined) whereConditions.user = { isAvailable };
    if (skills) whereConditions.skills = { has: skills };

    const [data, total] = await Promise.all([
        prisma.volunteerProfile.findMany({
            where: whereConditions,
            skip,
            take: Number(limit),
            orderBy: { averageRating: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        profileImage: true,
                        isAvailable: true,
                        bloodGroup: true,
                        latitude: true,
                        longitude: true,
                    },
                },
            },
        }),
        prisma.volunteerProfile.count({ where: whereConditions }),
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

const getVolunteerById = async (userId: string) => {
    const volunteer = await prisma.volunteerProfile.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    profileImage: true,
                    isAvailable: true,
                    bloodGroup: true,
                    latitude: true,
                    longitude: true,
                },
            },
        },
    });
    if (!volunteer) throw new AppError(status.NOT_FOUND, "Volunteer not found");
    return volunteer;
};

const getMyVolunteerProfile = async (userId: string) => {
    const volunteer = await prisma.volunteerProfile.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    profileImage: true,
                    isAvailable: true,
                    bloodGroup: true,
                },
            },
        },
    });
    if (!volunteer) throw new AppError(status.NOT_FOUND, "Volunteer profile not found");
    return volunteer;
};

const updateMyVolunteerProfile = async (userId: string, payload: IUpdateVolunteerProfile) => {
    const existing = await prisma.volunteerProfile.findUnique({ where: { userId } });
    if (!existing) throw new AppError(status.NOT_FOUND, "Volunteer profile not found");

    const { isAvailable, ...profileData } = payload;

    const [updated] = await prisma.$transaction([
        prisma.volunteerProfile.update({
            where: { userId },
            data: profileData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        isAvailable: true,
                    },
                },
            },
        }),
        ...(isAvailable !== undefined
            ? [prisma.user.update({ where: { id: userId }, data: { isAvailable } })]
            : []),
    ]);

    return updated;
};

const verifyVolunteer = async (userId: string) => {
    const volunteer = await prisma.volunteerProfile.findUnique({ where: { userId } });
    if (!volunteer) throw new AppError(status.NOT_FOUND, "Volunteer not found");
    if (volunteer.isVerified) throw new AppError(status.BAD_REQUEST, "Volunteer is already verified");

    return await prisma.volunteerProfile.update({
        where: { userId },
        data: { isVerified: true },
        include: {
            user: { select: { id: true, name: true, email: true } },
        },
    });
};

const deleteVolunteer = async (userId: string) => {
    const volunteer = await prisma.volunteerProfile.findUnique({ where: { userId } });
    if (!volunteer) throw new AppError(status.NOT_FOUND, "Volunteer not found");

    await prisma.$transaction([
        prisma.volunteerProfile.delete({ where: { userId } }),
        prisma.user.update({
            where: { id: userId },
            data: { isVolunteer: false, role: "USER" },
        }),
    ]);

    return { message: "Volunteer deleted successfully" };
};

export const volunteerService = {

    getAllVolunteers,
    getVolunteerById,
    getMyVolunteerProfile,
    updateMyVolunteerProfile,
    verifyVolunteer,
    deleteVolunteer,
};