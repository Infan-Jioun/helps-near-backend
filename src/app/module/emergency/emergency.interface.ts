import { EmergencyType } from "@prisma/client";
import { EmergencyStatus } from "../../../generated/prisma/client/enums";

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
export interface IUpdateEmergency {
    status?: EmergencyStatus;
    description?: string;
    imageUrl?: string;
    address?: string;
    district?: string;
    isPriority?: boolean;
    resolvedAt?: Date;
}