export declare function register(email: string, password: string, name?: string): Promise<{
    user: {
        id: string;
        email: string;
        name: string | null;
    };
    access: string;
    refresh: string;
    wedding: {
        name: string;
        date: Date | null;
        id: string;
    };
}>;
export declare function refresh(refreshToken: string): Promise<{
    access: string;
    refresh: string;
}>;
export declare function login(email: string, password: string): Promise<{
    user: {
        id: string;
        email: string;
        name: string | null;
    };
    access: string;
    refresh: string;
    wedding: {
        name: string;
        date: Date | null;
        id: string;
    };
}>;
export declare function logout(refreshToken: string): Promise<{
    ok: boolean;
}>;
export declare function forgotPassword(email: string): Promise<{
    ok: boolean;
}>;
export declare function resetPassword(rawToken: string, newPassword: string): Promise<{
    ok: boolean;
}>;
export declare function getProfile(userId: string): Promise<{
    name: string | null;
    email: string;
    id: string;
}>;
export declare function updateProfile(userId: string, data: {
    name?: string | null | undefined;
    email?: string | undefined;
}): Promise<{
    name: string | null;
    email: string;
    id: string;
}>;
export declare function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
    ok: boolean;
}>;
//# sourceMappingURL=auth.service.d.ts.map