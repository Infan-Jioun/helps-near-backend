import { Role } from "../../generated/prisma/client/enums";


export interface IRequestUser {
    userId: string;
    role: Role;
    email: string;
}