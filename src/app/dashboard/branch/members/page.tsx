import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function BranchMembersPage() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "GYMADMIN" && session?.user?.role !== "SUPERADMIN") redirect("/dashboard");

    const members = await prisma.user.findMany({
        where: { gymBranchId: session.user.gymBranchId || undefined, role: "MEMBER" },
        orderBy: { createdAt: 'desc' }
    });

    const branch = session.user.gymBranchId
        ? await prisma.gymBranch.findUnique({ where: { id: session.user.gymBranchId } })
        : null;

    return (
        <div className="w-full">
            <h1 className="text-3xl font-display uppercase tracking-wider text-white mb-2">Member Control</h1>
            <p className="text-white/40 font-sans text-sm mb-10">
                {branch ? `Athletes enrolled at ${branch.name}` : "Branch member management"}
            </p>

            <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-white/40">
                    <span className="text-white font-bold">{members.length}</span> athletes enrolled
                </div>
                <button className="px-4 py-2 bg-accent-gold text-background font-bold text-xs uppercase tracking-wider rounded hover:bg-transparent hover:text-accent-gold border border-accent-gold transition-colors">
                    Invite Athlete
                </button>
            </div>

            {members.length === 0 ? (
                <div className="glass rounded-2xl border border-white/[0.05] h-64 flex items-center justify-center">
                    <p className="text-white/30 font-sans text-sm">No members enrolled in this branch yet.</p>
                </div>
            ) : (
                <div className="glass rounded-2xl border border-white/[0.05] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                                    <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Athlete</th>
                                    <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Plan</th>
                                    <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Joined</th>
                                    <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => (
                                    <tr key={member.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-xs text-white uppercase font-bold">
                                                    {member.name?.charAt(0) || "A"}
                                                </div>
                                                <div>
                                                    <div className="text-sm text-white">{member.name}</div>
                                                    <div className="text-xs text-white/40">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs ${member.membershipPlan === 'FREE' ? 'text-white/40' : 'text-accent-gold'}`}>
                                                {member.membershipPlan}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs text-white/60">
                                            {format(new Date(member.createdAt), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-xs text-accent-gold hover:text-white transition-colors">Manage</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
