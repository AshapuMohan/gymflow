import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AddPlanForm from "./AddPlanForm";

export default async function BranchPlansPage() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "GYMADMIN" && session?.user?.role !== "SUPERADMIN") redirect("/dashboard");

    const plans = await prisma.membershipPlan.findMany({
        where: { gymBranchId: session.user.gymBranchId || undefined },
        orderBy: { price: 'asc' }
    });

    return (
        <div className="w-full">
            <h1 className="text-3xl font-display uppercase tracking-wider text-white mb-2">Membership Plans</h1>
            <p className="text-white/40 font-sans text-sm mb-10">
                Create and manage subscription plans for your athletes.
            </p>

            <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-white/40">
                    <span className="text-white font-bold">{plans.length}</span> active plans
                </div>
                <AddPlanForm />
            </div>

            {plans.length === 0 ? (
                <div className="glass rounded-2xl border border-white/[0.05] h-64 flex items-center justify-center">
                    <p className="text-white/30 font-sans text-sm">No membership plans created yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan: any) => (
                        <div key={plan.id} className="glass border border-white/10 rounded-xl p-6 flex flex-col relative overflow-hidden group hover:border-accent-gold/50 transition-colors">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-gold/5 rounded-bl-full -z-10 group-hover:bg-accent-gold/20 transition-colors" />
                            <h3 className="text-xl font-display uppercase text-white tracking-wider mb-2">{plan.name}</h3>
                            <div className="flex items-end gap-1 mb-6">
                                <span className="text-3xl text-accent-gold font-bold">${plan.price.toFixed(2)}</span>
                                <span className="text-white/40 text-sm mb-1 uppercase tracking-widest">/{plan.interval}</span>
                            </div>
                            <div className="space-y-3 mb-8 flex-1">
                                {(plan.features || "").split(",").map((feat: string, i: number) => (
                                    <div key={i} className="flex gap-2 items-start text-sm text-white/60">
                                        <span className="text-accent-gold">✔</span>
                                        <span>{feat.trim()}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs uppercase tracking-widest rounded transition-colors border border-white/10">
                                Edit Plan
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
