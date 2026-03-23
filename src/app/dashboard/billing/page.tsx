import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { CreditCard, CheckCircle } from "lucide-react";
import SubscribeButton from "./SubscribeButton";

export default async function MemberBillingPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const subscription = await prisma.subscription.findFirst({
        where: { userId: session.user.id },
    });

    const currentPlan = (session.user as any).membershipPlan || "FREE";
    const userRole = session.user.role || "MEMBER";

    // Only Members use this specific page to buy memberships, but GymAdmins can see it too
    // We will fetch plans for their branch
    const plans = await prisma.membershipPlan.findMany({
        where: { gymBranchId: session.user.gymBranchId || undefined },
        orderBy: { price: 'asc' }
    });

    return (
        <div className="w-full">
            <h1 className="text-3xl font-display uppercase tracking-wider text-white mb-2">Subscription Protocol</h1>
            <p className="text-white/40 font-sans text-sm mb-10">Manage your membership tier and billing details.</p>

            {/* Current Status */}
            {subscription ? (
                <div className="glass rounded-2xl border border-accent-gold/20 p-6 md:p-8 mb-10 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle size={14} className="text-green-400" />
                            <span className="text-xs uppercase tracking-[0.2em] text-green-400 font-bold">Active</span>
                        </div>
                        <div className="text-2xl font-display text-white tracking-wider">{subscription.plan}</div>
                        {subscription.currentPeriodEnd && (
                            <div className="text-xs text-white/40 mt-1">
                                Renews {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
                            </div>
                        )}
                    </div>
                    <button className="px-4 py-2 border border-red-500/30 text-red-400 text-xs uppercase tracking-wider rounded hover:border-red-500 hover:bg-red-500/10 transition-colors">
                        Cancel
                    </button>
                </div>
            ) : (
                <div className="glass rounded-2xl border border-white/[0.05] p-6 md:p-8 mb-10 flex items-center gap-4">
                    <CreditCard className="text-white/20" size={24} />
                    <div>
                        <div className="text-sm text-white/60">No active subscription</div>
                        <div className="text-xs text-white/30">Choose a plan below to unlock full access.</div>
                    </div>
                </div>
            )}

            {/* Plan Selection */}
            {plans.length === 0 ? (
                <div className="glass rounded-2xl border border-white/[0.05] p-6 text-center text-white/40">
                    No membership plans available for your branch yet. Please contact your Gym Administrator.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`glass p-6 md:p-8 rounded-2xl border transition-colors ${currentPlan === plan.name ? 'border-accent-gold/40' : 'border-white/[0.05]'} ${currentPlan === plan.name ? 'opacity-60' : ''}`}>
                            <div className="text-xl font-display text-white tracking-wider mb-1 uppercase">{plan.name}</div>
                            <div className="flex items-end gap-1 mb-6">
                                <div className="text-3xl font-mono text-white">${plan.price.toFixed(2)}</div>
                                <div className="text-xs text-white/40 uppercase mb-1">/{plan.interval}</div>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {(plan.features || "").split(',').map((feat, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs text-white/60">
                                        <span className="w-1 h-1 rounded-full bg-accent-gold flex-shrink-0" />
                                        <span>{feat.trim()}</span>
                                    </li>
                                ))}
                            </ul>

                            {userRole === 'MEMBER' && (
                                <SubscribeButton planId={plan.id} isCurrent={currentPlan === plan.name} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
