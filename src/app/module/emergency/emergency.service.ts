
import status from "http-status";
import AppError from "../../errorHelper/appError";
import { prisma } from "../../lib/prisma";
import { ICreateEmargency, IUpdateEmergency } from "./emergency.interface"
import { IRequestUser } from "../../interface/requestUserInterface";
const getMyEmargencies = async (userId: string) => {
    try {
        const emergencies = await prisma.emergency.findMany({
            where: {
                userId
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true },
                },
                responses: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return emergencies;
    } catch (error: any) {
        console.error("getMyEmargencies error:", error);
        throw new AppError(status.BAD_REQUEST, error?.message || "Failed to fetch my emergencies");
    }
};
const createEmargency = async (userId: string, payload: ICreateEmargency) => {
    const result = await prisma.emergency.create({
        data: {
            ...payload,
            user: {
                connect: { id: userId }
            }
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    profileImage: true,

                }
            }

        }

    })
    return result;
}
const getAllEmargencies = async (filters?: {
    type?: string;
    status?: string;
    district?: string;
    isPriority?: string;
    page?: number;
    limit?: number;
}) => {
    const where: any = {};

    if (filters?.type && filters.type !== "ALL") where.type = filters.type;
    if (filters?.status && filters.status !== "ALL") where.status = filters.status;
    if (filters?.district && filters.district.trim()) {
        where.district = { contains: filters.district.trim(), mode: "insensitive" };
    }
    if (filters?.isPriority && filters.isPriority !== "ALL") {
        where.isPriority = filters.isPriority === "true";
    }

    const page = Number(filters?.page) || 1;
    const limit = Number(filters?.limit) || 9;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        prisma.emergency.findMany({
            where,
            orderBy: [{ isPriority: "desc" }, { createdAt: "desc" }],
            include: { user: { select: { id: true, name: true, email: true } } },
            skip,
            take: limit,
        }),
        prisma.emergency.count({ where }),
    ]);

    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};


const getEmargencyById = async (id: string, userId: string, userRole: string) => {
    const emergency = await prisma.emergency.findUnique({
        where: { id },
        include: {
            user: {
                select: { id: true, name: true, email: true, phone: true },
            },
            responses: true,
        },
    });

    if (!emergency) {
        throw new Error("Emergency not found");
    }


    return emergency;
};
const updateEmargency = async (id: string, userId: string, userRole: string, payload: IUpdateEmergency) => {
    const emergency = await prisma.emergency.findUnique({ where: { id } });
    if (!emergency) throw new Error("Emergency not found");
    if (emergency.userId !== userId && userRole !== "ADMIN") {
        throw new Error("You are not authorized");
    }
    return await prisma.emergency.update({ where: { id }, data: payload });
};

const deleteEmargency = async (id: string, userId: string, userRole: string) => {
    const emergency = await prisma.emergency.findUnique({ where: { id } });
    if (!emergency) throw new Error("Emergency not found");
    if (emergency.userId !== userId && userRole !== "ADMIN") {
        throw new Error("You are not authorized");
    }
    await prisma.emergency.delete({ where: { id } });
    return null;
};

export const emargencyService = {
    createEmargency,
    getAllEmargencies,
    getMyEmargencies,
    getEmargencyById,
    updateEmargency,
    deleteEmargency
};