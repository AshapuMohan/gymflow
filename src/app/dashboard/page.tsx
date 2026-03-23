import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export default async function MemberDashboard() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) return null;

    // Ideally fetch from DB
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            subscriptions: true,
            orders: {
                take: 3,
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    return (
        <div className="w-full">
            <h1 className="text-3xl font-display uppercase tracking-wider text-white mb-2">
                Command Center
            </h1>
            <p className="text-white/40 font-sans text-sm mb-12">
                Welcome back, {user?.name || "Athlete"}.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Status Card */}
                <div className="glass p-6 md:p-8 rounded-2xl border border-white/[0.05] flex flex-col justify-between col-span-1 lg:col-span-2">
                    <div>
                        <span className="text-[10px] text-accent-gold uppercase tracking-[0.2em] font-bold mb-2 block">
                            Protocol Status
                        </span>
                        <h2 className="text-2xl font-sans text-white mb-4">
                            {user?.membershipPlan ? `${user.membershipPlan} MEMBER` : "NO ACTIVE PROTOCOL"}
                        </h2>
                    </div>

                    <div className="pt-6 border-t border-white/[0.05] flex justify-between items-center">
                        <div>
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.1em]">Next Billing</p>
                            <p className="text-sm text-white font-mono mt-1">
                                {user?.subscriptionStatus === "active" ? "OCT 24, 2026" : "N/A"}
                            </p>
                        </div>
                        <button className="px-6 py-2 bg-white/10 hover:bg-white text-white hover:text-background rounded-full text-[10px] uppercase tracking-[0.1em] font-bold transition-all">
                            Manage
                        </button>
                    </div>
                </div>

                {/* Store Access Card */}
                <div className="glass p-6 rounded-2xl border border-white/[0.05] flex flex-col gap-4">
                    <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-2">
                        Arsenal Access
                    </span>
                    <a
                        href="/store"
                        className="w-full py-4 text-left px-6 rounded-xl border border-white/[0.05] hover:border-accent-gold/50 hover:bg-accent-gold/5 text-sm text-white transition-all flex justify-between items-center group"
                    >
                        <span>
                            <span className="block text-xs text-accent-gold uppercase tracking-wider mb-0.5">New</span>
                            Shop Performance Gear
                        </span>
                        <span className="text-accent-gold group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                    <a
                        href="/dashboard/orders"
                        className="w-full py-4 text-left px-6 rounded-xl border border-white/[0.05] hover:border-accent-gold/50 text-sm text-white transition-colors flex justify-between items-center group"
                    >
                        My Order History
                        <span className="text-white/30 group-hover:text-accent-gold group-hover:translate-x-1 transition-all">→</span>
                    </a>
                    <a
                        href="/dashboard/billing"
                        className="w-full py-4 text-left px-6 rounded-xl border border-white/[0.05] hover:border-accent-gold/50 text-sm text-white transition-colors flex justify-between items-center group"
                    >
                        Manage Subscription
                        <span className="text-white/30 group-hover:text-accent-gold group-hover:translate-x-1 transition-all">→</span>
                    </a>
                </div>

            </div>

            <div className="mt-12">
                <h3 className="text-sm text-white/60 uppercase tracking-wider font-semibold mb-6">Recent Deployments (Orders)</h3>

                {user?.orders && user.orders.length > 0 ? (
                    <div className="glass rounded-xl border border-white/[0.05] overflow-hidden">
                        <table className="w-full text-left text-sm font-sans">
                            <thead className="bg-white/[0.02] border-b border-white/[0.05] text-[10px] uppercase tracking-wider text-white/40">
                                <tr>
                                    <th className="px-6 py-4 font-normal">Order ID</th>
                                    <th className="px-6 py-4 font-normal">Date</th>
                                    <th className="px-6 py-4 font-normal">Status</th>
                                    <th className="px-6 py-4 font-normal">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                                {user.orders.map((order: { id: string, createdAt: Date, status: string, totalAmount: number }) => (
                                    <tr key={order.id} className="text-white/80 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">{order.id.slice(0, 8)}</td>
                                        <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-accent-gold/10 text-accent-gold rounded-full text-[10px] uppercase font-bold tracking-wider">
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono">${order.totalAmount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="glass p-12 rounded-2xl border border-white/[0.05] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            {/* 3D placeholder or icon */}
                            <span className="text-white/20">∅</span>
                        </div>
                        <p className="text-white/60 text-sm">No orders found.</p>
                        <p className="text-white/40 text-xs mt-2">Your arsenal awaits your command.</p>
                    </div>
                )}
            </div>

        </div>
    );
}
