import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: 'jwt',
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // Verify the user exists in the new schema
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { branch: true }
                });

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    gymBranchId: user.gymBranchId,
                    tenantId: null,
                    tenantSlug: null,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.gymBranchId = user.gymBranchId;
                token.tenantId = user.tenantId;
                token.tenantSlug = user.tenantSlug;
            }
            if (trigger === "update" && session) {
                token = { ...token, ...session }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string;
                session.user.role = token.role as string;
                session.user.gymBranchId = token.gymBranchId as string | null;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
