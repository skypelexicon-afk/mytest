export enum Role {
    STUDENT = "student",
    EDUCATOR = "educator",
    SUPER_ADMIN = "super_admin",
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    userType: Role;
    phone?: string;
    address?: string;
    university?: string;
    profilePicture?: string;
    is_verified: boolean;
}   