export declare enum UserRole {
    AGENT = "AGENT",
    GFSU_AC = "GFSU_AC",
    CAC = "CAC",
    TREASURY = "TREASURY",
    SG_AP = "SG_AP",
    ADMIN = "ADMIN"
}
export declare class PortalUser {
    id: string;
    userId: string;
    email: string;
    passwordHash: string;
    fullName: string;
    role: UserRole;
    assignedOfficeCode: string;
    isDemoUser: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdById: string;
}
