import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import SaasBillingClient from "./billing/SaasBillingClient";

export default async function BranchDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return <>{children}</>;
    }

    // Only apply this logic to GYMADMINs
    if (session.user.role !== "GYMADMIN") {
        return <>{children}</>;
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { branch: true }
    });

    if (!user || !user.branch) {
        return (
            <div className="flex items-center justify-center p-12 bg-surface border border-red-500/20 rounded-xl h-[400px]">
                <div className="text-center">
                    <h2 className="text-xl font-display uppercase tracking-widest text-white mb-2">No Branch Assigned</h2>
                    <p className="text-white/60 text-sm">Please contact SuperAdmin to assign a branch.</p>
                </div>
            </div>
        );
    }

    if (user.branch.saasStatus !== "active") {
        return (
            <div className="w-full h-[600px] flex items-center justify-center relative">
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-xl" />
                <div className="relative z-10 max-w-lg w-full bg-surface border border-accent-gold/20 p-10 rounded-xl text-center shadow-2xl">
                    <div className="w-16 h-16 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-2xl">⚡</span>
                    </div>
                    <h2 className="text-2xl font-display text-white mb-4 uppercase tracking-widest">SaaS Subscription Required</h2>
                    <p className="text-white/60 mb-8 text-sm leading-relaxed">
                        Your Titan X SaaS subscription is currently <span className="text-red-400 font-bold uppercase">{user.branch.saasStatus}</span>.
                        Please renew your subscription to regain access to your branch dashboard, members, classes, and arsenal management.
                    </p>
                    <SaasBillingClient />
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
