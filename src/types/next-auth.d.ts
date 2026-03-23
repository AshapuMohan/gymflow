import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            gymBranchId: string | null;
            tenantId?: string | null;
            tenantSlug?: string | null;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        role: string;
        gymBranchId: string | null;
        tenantId?: string | null;
        tenantSlug?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string;
        gymBranchId: string | null;
        tenantId?: string | null;
        tenantSlug?: string | null;
    }
}
