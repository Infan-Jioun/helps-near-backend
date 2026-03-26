import { EmergencyType } from "@prisma/client";

export interface ICreateEmargency {
    type: EmergencyType,
    description?: string;
    imageUrl?: string;
    latitude: number;
    longitude: number;
    address?: string;
    district?: string;
    isPriority?: boolean;
}