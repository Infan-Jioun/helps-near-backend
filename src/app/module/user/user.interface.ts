import { Role, Status, BloodGroup, VolunteerSkill } from "../../../generated/prisma/client/enums";
export interface ICreateVolunteerProfile {
    name: string;
    email: string;
    password: string;
    nidNumber?: string;
    skills?: VolunteerSkill[];
    bio?: string;
    latitude?: number;
    longitude?: number;
    fee: number
}
export interface IUpdateUserRole {
    role: Role;
}

export interface IUpdateUserStatus {
    status: Status;
}

export interface IUpdateMyProfile {
    name?: string;
    phone?: string;
    profileImage?: string;
    bloodGroup?: BloodGroup;
    latitude?: number;
    longitude?: number;
}

export interface IUserFilterRequest {
    role?: Role;
    status?: Status;
    searchTerm?: string;
    page?: number;
    limit?: number;
}