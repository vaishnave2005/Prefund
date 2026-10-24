import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
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
    me(req: any): Promise<any>;
}
