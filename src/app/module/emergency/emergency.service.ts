
import { prisma } from "../../lib/prisma";
import { ICreateEmargency } from "./emergency.interface"

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
const getAllEmargencies = async () => {
    return await prisma.emergency.findMany({
        orderBy: [{ isPriority: "desc" }, { createdAt: "desc" }],
        include: {
            user: { select: { id: true, name: true, email: true } },
        },
    });
};

const getEmargencyById = async (id: string) => {
    const emergency = await prisma.emergency.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            responses: true,
        },
    });
    if (!emergency) throw new Error("Emergency not found");
    return emergency;
};

const updateEmargency = async (id: string, userId: string, userRole: string, payload: Partial<ICreateEmargency>) => {
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
    getEmargencyById,
    updateEmargency,
    deleteEmargency,
};