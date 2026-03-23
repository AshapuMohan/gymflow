import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export default async function BranchBillingPage() {
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({
        where: { email: session?.user?.email || "" },
        include: { branch: true }
    });

    const status = user?.branch?.saasStatus || 'Unknown';

    return (
        <div className="max-w-3xl">
            <h1 className="text-3xl font-display uppercase tracking-widest text-white mb-2">SaaS Billing</h1>
            <p className="text-white/60 mb-12">Manage your Titan X platform subscription.</p>

            <div className="bg-surface border border-white/10 rounded-xl p-8">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/5">
                    <div>
                        <h2 className="text-xl font-display text-white tracking-wider mb-2">Current Status</h2>
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-3 w-3">
                                {status === 'active' ? (
                                    <>
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </>
                                ) : (
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                )}
                            </span>
                            <span className="text-white uppercase tracking-widest text-sm">{status}</span>
                        </div>
                    </div>
                    {status === 'active' && (
                        <div className="text-right">
                            <p className="text-white/40 text-xs tracking-wider mb-1">PLAN</p>
                            <p className="text-accent-gold font-bold uppercase">TITAN X PRO</p>
                        </div>
                    )}
                </div>

                <div className="max-w-md">
                    <p className="text-white/60 text-sm mb-6 leading-relaxed">
                        Your branch requires an active SaaS standard subscription to maintain access to Member Analytics, Store Control, and Class Scheduling.
                        Your subscription is currently active.
                    </p>
                </div>
            </div>
        </div>
    );
}
