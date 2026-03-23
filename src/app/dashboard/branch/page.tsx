import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function BranchDashboardOverview() {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "GYMADMIN" && session?.user?.role !== "SUPERADMIN") {
        redirect("/dashboard");
    }

    // Fetch the specific branch details for this gym admin
    const branchData = await prisma.gymBranch.findUnique({
        where: { id: session.user.gymBranchId || "" },
        include: { users: true }
    });

    // Fallback Mock Data for UI presentation
    const stats = {
        branchName: branchData?.name || "Unassigned Branch",
        totalMembers: branchData?.users.length || 312,
        activeClasses: 14,
        monthlyRevenue: "$12,450"
    };

    return (
        <div className="w-full">
            <h1 className="text-3xl font-display uppercase tracking-wider text-white mb-2">
                {stats.branchName}
            </h1>
            <p className="text-white/40 font-sans text-sm mb-12">
                Manage your facility operations and member performance.
            </p>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="glass p-6 md:p-8 rounded-2xl border border-white/[0.05]">
                    <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold block mb-4">
                        Total Enrolled Members
                    </span>
                    <div className="text-4xl font-mono text-white">{stats.totalMembers}</div>
                    <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
                        <span className="rotate-[-45deg]">→</span>
                        +5 this week
                    </div>
                </div>

                <div className="glass p-6 md:p-8 rounded-2xl border border-white/[0.05]">
                    <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold block mb-4">
                        Branch Revenue
                    </span>
                    <div className="text-4xl font-mono text-white">{stats.monthlyRevenue}</div>
                    <div className="text-xs text-white/40 mt-2">Current period</div>
                </div>

                <div className="glass p-6 md:p-8 rounded-2xl border border-white/[0.05]">
                    <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold block mb-4">
                        Active Classes
                    </span>
                    <div className="text-4xl font-mono text-white">{stats.activeClasses}</div>
                    <div className="text-xs text-accent-gold mt-2 border-b border-accent-gold/30 inline-block pb-1 cursor-pointer hover:border-accent-gold">
                        Manage Schedule
                    </div>
                </div>
            </div>

            {/* Tables Placeholder */}
            <div className="w-full h-64 glass rounded-2xl border border-white/[0.05] flex items-center justify-center">
                <p className="text-white/40 text-sm font-sans">Attendance and Revenue charts block</p>
            </div>
        </div>
    );
}
