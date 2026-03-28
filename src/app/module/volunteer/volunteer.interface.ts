import { VolunteerSkill } from "../../../generated/prisma/enums";




export interface IUpdateVolunteerProfile {
    name?: string,
    nidNumber?: string;
    skills?: VolunteerSkill[];
    bio?: string;
    latitude?: number;
    longitude?: number;
    isAvailable?: boolean;
}

export interface IVolunteerFilterRequest {
    isVerified?: boolean;
    isAvailable?: boolean;
    skills?: VolunteerSkill;
    district?: string;
    page?: number;
    limit?: number;
}
