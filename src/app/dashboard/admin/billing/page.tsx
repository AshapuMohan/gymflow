import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminBillingPage() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "SUPERADMIN") redirect("/dashboard");

    const [totalUsers, totalOrders, activeSubscriptions] = await Promise.all([
        prisma.user.count(),
        prisma.order.count(),
        prisma.subscription.count({ where: { status: 'active' } }),
    ]);

    const recentOrders = await prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } }
    });

    // Simulated MRR based on subscriptions (in real prod this comes from Stripe)
    const simulatedMRR = (activeSubscriptions * 49).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    return (
        <div className="w-full">
            <h1 className="text-3xl font-display uppercase tracking-wider text-white mb-2">Revenue Command</h1>
            <p className="text-white/40 font-sans text-sm mb-10">Global financial performance and billing control.</p>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                    { label: "Monthly Recurring Revenue", value: simulatedMRR, note: "Simulated via active subscriptions" },
                    { label: "Total Athletes", value: totalUsers.toString(), note: "All registered accounts" },
                    { label: "Active Subscriptions", value: activeSubscriptions.toString(), note: "Paying members" },
                ].map((stat) => (
                    <div key={stat.label} className="glass p-6 md:p-8 rounded-2xl border border-white/[0.05]">
                        <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold block mb-4">{stat.label}</span>
                        <div className="text-4xl font-mono text-white mb-2">{stat.value}</div>
                        <div className="text-xs text-white/30">{stat.note}</div>
                    </div>
                ))}
            </div>

            {/* Recent Transactions */}
            <div className="glass rounded-2xl border border-white/[0.05] overflow-hidden">
                <div className="p-6 border-b border-white/[0.05]">
                    <h2 className="text-xs uppercase tracking-[0.2em] text-white/60 font-bold">Recent Transactions</h2>
                </div>
                {recentOrders.length === 0 ? (
                    <div className="p-12 text-center text-white/30 text-sm">No transactions recorded yet.</div>
                ) : (
                    <div className="divide-y divide-white/[0.03]">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                <div>
                                    <div className="text-sm text-white">{order.user?.name || "Unknown"}</div>
                                    <div className="text-xs text-white/40">{order.user?.email}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-white font-mono">${order.totalAmount.toFixed(2)}</div>
                                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${order.status === 'PAID' ? 'bg-green-500/10 text-green-400' :
                                            order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                                                'bg-white/5 text-white/40'
                                        }`}>{order.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
