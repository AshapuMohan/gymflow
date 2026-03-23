import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminDashboardOverview() {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "SUPERADMIN" && session?.user?.role !== "GYMADMIN") {
        redirect("/dashboard");
    }

    // Pre-calculate data (Mock for logic setup)
    const stats = {
        mrr: "$4,520",
        activeUsers: 84,
        recentOrders: 12,
    };

    return (
        <div className="w-full">
            <h1 className="text-3xl font-display uppercase tracking-wider text-white mb-2">
                Titan Admin Console
            </h1>
            <p className="text-white/40 font-sans text-sm mb-12">
                Global metrics and system control.
            </p>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="glass p-6 md:p-8 rounded-2xl border border-white/[0.05]">
                    <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold block mb-4">
                        Monthly Recurring Revenue
                    </span>
                    <div className="text-4xl font-mono text-white">{stats.mrr}</div>
                    <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
                        <span className="rotate-[-45deg]">→</span>
                        +12.5% vs last month
                    </div>
                </div>

                <div className="glass p-6 md:p-8 rounded-2xl border border-white/[0.05]">
                    <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold block mb-4">
                        Active Athletes
                    </span>
                    <div className="text-4xl font-mono text-white">{stats.activeUsers}</div>
                    <div className="text-xs text-white/40 mt-2">Across all tiers</div>
                </div>

                <div className="glass p-6 md:p-8 rounded-2xl border border-white/[0.05]">
                    <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold block mb-4">
                        Pending Deployments
                    </span>
                    <div className="text-4xl font-mono text-white">{stats.recentOrders}</div>
                    <div className="text-xs text-accent-gold mt-2 border-b border-accent-gold/30 inline-block pb-1 cursor-pointer hover:border-accent-gold">
                        Review Orders
                    </div>
                </div>
            </div>

            {/* Tables Placeholder */}
            <div className="w-full h-64 glass rounded-2xl border border-white/[0.05] flex items-center justify-center">
                <p className="text-white/40 text-sm font-sans">Analytics charts rendered via Recharts here</p>
            </div>
        </div>
    );
}
