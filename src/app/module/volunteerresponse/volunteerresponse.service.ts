import status from "http-status";
import AppError from "../../errorHelper/appError";
import { prisma } from "../../lib/prisma";
import { ICreateVolunteerResponse } from "./volunteerresponse.interface";



const acceptEmergency = async (
    emergencyId: string,
    volunteerId: string,
    payload: ICreateVolunteerResponse
) => {
    const emergency = await prisma.emergency.findUnique({ where: { id: emergencyId } });
    if (!emergency) throw new AppError(status.NOT_FOUND, "Emergency not found");

    if (emergency.status === "RESOLVED" || emergency.status === "CANCELLED") {
        throw new AppError(status.BAD_REQUEST, `Cannot accept a ${emergency.status.toLowerCase()} emergency`);
    }

    const alreadyAccepted = await prisma.volunteerResponse.findUnique({
        where: { emergencyId_volunteerId: { emergencyId, volunteerId } },
    });
    if (alreadyAccepted) throw new AppError(status.CONFLICT, "You have already accepted this emergency");

    const volunteerProfile = await prisma.volunteerProfile.findUnique({
        where: { userId: volunteerId },
    });
    if (!volunteerProfile) throw new AppError(status.NOT_FOUND, "Volunteer profile not found");

    const [response] = await prisma.$transaction([
        prisma.volunteerResponse.create({
            data: {
                emergencyId,
                volunteerId,
                estimatedArrivalMin: payload.estimatedArrivalMin,
            },
            include: {
                volunteer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        profileImage: true,
                        volunteerProfile: {
                            select: {
                                skills: true,
                                averageRating: true,
                                isVerified: true,
                            },
                        },
                    },
                },
                emergency: {
                    select: {
                        id: true,
                        type: true,
                        status: true,
                        address: true,
                        district: true,
                    },
                },
            },
        }),
        prisma.emergency.update({
            where: { id: emergencyId },
            data: { status: "IN_PROGRESS" },
        }),
    ]);

    return response;
};

const getResponsesByEmergencyId = async (emergencyId: string) => {
    const emergency = await prisma.emergency.findUnique({ where: { id: emergencyId } });
    if (!emergency) throw new AppError(status.NOT_FOUND, "Emergency not found");

    return await prisma.volunteerResponse.findMany({
        where: { emergencyId },
        orderBy: { acceptedAt: "asc" },
        include: {
            volunteer: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    profileImage: true,
                    latitude: true,
                    longitude: true,
                    volunteerProfile: {
                        select: {
                            skills: true,
                            averageRating: true,
                            isVerified: true,
                            totalHelped: true,
                            bio: true,
                        },
                    },
                },
            },
        },
    });
};

const getMyResponses = async (volunteerId: string) => {
    return await prisma.volunteerResponse.findMany({
        where: { volunteerId },
        orderBy: { acceptedAt: "desc" },
        include: {
            emergency: {
                select: {
                    id: true,
                    type: true,
                    status: true,
                    description: true,
                    address: true,
                    district: true,
                    latitude: true,
                    longitude: true,
                    isPriority: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                        },
                    },
                },
            },
        },
    });
};

const cancelResponse = async (emergencyId: string, volunteerId: string) => {
    const response = await prisma.volunteerResponse.findUnique({
        where: { emergencyId_volunteerId: { emergencyId, volunteerId } },
    });
    if (!response) throw new AppError(status.NOT_FOUND, "Response not found");

    await prisma.volunteerResponse.delete({
        where: { emergencyId_volunteerId: { emergencyId, volunteerId } },
    });

    const remainingResponses = await prisma.volunteerResponse.count({ where: { emergencyId } });

    if (remainingResponses === 0) {
        await prisma.emergency.update({
            where: { id: emergencyId },
            data: { status: "PENDING" },
        });
    }

    return { message: "Response cancelled successfully" };
};

export const volunteerResponseService = {
    acceptEmergency,
    getResponsesByEmergencyId,
    getMyResponses,
    cancelResponse,
};