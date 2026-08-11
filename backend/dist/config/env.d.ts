import 'dotenv/config';
export declare const env: {
    port: number;
    nodeEnv: string;
    isProduction: boolean;
    appBaseUrl: string;
    corsOrigins: string[];
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpires: string;
        refreshExpires: string;
    };
    mail: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        pass: string;
        from: string;
    };
    ai: {
        apiKey: string;
        model: string;
        timeoutMs: number;
    };
};
//# sourceMappingURL=env.d.ts.map