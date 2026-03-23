import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function AdminUsersPage() {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "SUPERADMIN") {
        redirect("/dashboard");
    }

    // Fetch all users
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-display uppercase tracking-wider text-white mb-2">
                        User Management
                    </h1>
                    <p className="text-white/40 font-sans text-sm">
                        Global control of all registered athletes and gym branches.
                    </p>
                </div>

                <button className="px-4 py-2 bg-accent-gold text-background font-bold text-xs uppercase tracking-wider rounded border border-accent-gold hover:bg-transparent hover:text-accent-gold transition-colors">
                    Export CSV
                </button>
            </div>

            {/* Data Table */}
            <div className="glass rounded-2xl border border-white/[0.05] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Athlete</th>
                                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Role</th>
                                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Plan</th>
                                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Enlisted</th>
                                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-xs text-white uppercase font-bold">
                                                {user.name?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <div className="text-sm text-white font-medium">{user.name || "Unknown Athlete"}</div>
                                                <div className="text-xs text-white/40">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded inline-block font-bold ${user.role === 'SUPERADMIN' ? 'bg-red-500/20 text-red-400' :
                                                user.role === 'GYMADMIN' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-white/10 text-white/60'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs ${user.membershipPlan === 'FREE' ? 'text-white/40' : 'text-accent-gold'}`}>
                                            {user.membershipPlan}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-white/60">
                                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-xs text-accent-gold hover:text-white transition-colors underline decoration-accent-gold/30 underline-offset-4">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
