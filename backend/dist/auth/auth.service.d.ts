import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { PortalUser } from '../entities';
export declare class AuthService {
    private userRepo;
    private jwtService;
    constructor(userRepo: Repository<PortalUser>, jwtService: JwtService);
    login(email: string, password: string): Promise<{
        access_token: string;
        user: {
            id: string;
            userId: string;
            email: string;
            fullName: string;
            role: import("../entities").UserRole;
            assignedOfficeCode: string;
        };
    }>;
    findById(id: string): Promise<PortalUser>;
    findAll(): Promise<PortalUser[]>;
    createUser(data: Partial<PortalUser>): Promise<PortalUser>;
    updateUser(id: string, data: Partial<PortalUser>): Promise<PortalUser>;
    deleteUser(id: string): Promise<void>;
}
