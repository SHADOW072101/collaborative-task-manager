import { RegisterDto, LoginDto, UpdateProfileDto } from './auth.dto';
import { AuthResponse, UserPayload } from './auth.types';
export declare class AuthService {
    register(data: RegisterDto): Promise<AuthResponse>;
    login(data: LoginDto): Promise<AuthResponse>;
    getCurrentUser(userId: string): Promise<{
        name: string;
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, data: UpdateProfileDto): Promise<{
        name: string;
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private generateToken;
    verifyToken(token: string): UserPayload;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map