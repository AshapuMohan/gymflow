import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShoppingBag, TrendingUp, Users, Package } from "lucide-react";
import AdminOrdersTable from "@/components/admin/AdminOrdersTable";

export default async function AdminOrdersPage() {
    const session = await getServerSession(authOptions);
    if (!["SUPERADMIN", "GYMADMIN"].includes(session?.user?.role || "")) {
        redirect("/dashboard");
    }

    const isSuperAdmin = session?.user?.role === "SUPERADMIN";

    const orders = await prisma.order.findMany({
        where: isSuperAdmin
            ? {}
            : { user: { gymBranchId: session?.user?.gymBranchId ?? "" } },
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { name: true, email: true } },
            items: {
                include: {
                    product: { select: { name: true, imageUrl: true, category: true } }
                }
            }
        }
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalItems = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
    const uniqueMembers = new Set(orders.map(o => o.userId)).size;

    // Serialize dates so they can be passed to the client component
    const serialized = orders.map(o => ({
        ...o,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt?.toISOString?.() ?? "",
    }));

    return (
        <div className="w-full">
            <h1 className="text-3xl font-display uppercase tracking-wider text-white mb-2">
                {isSuperAdmin ? "Global Order Intelligence" : "Branch Order Center"}
            </h1>
            <p className="text-white/40 font-sans text-sm mb-10">
                {isSuperAdmin
                    ? "All member orders across every branch. Update status below."
                    : "Orders from your branch members. Update status to notify the member's tracker."}
            </p>

            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="glass rounded-2xl border border-white/[0.05] p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <TrendingUp size={16} className="text-accent-gold" />
                        <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Store Revenue</span>
                    </div>
                    <div className="text-3xl font-mono text-white">${totalRevenue.toFixed(2)}</div>
                    <div className="text-xs text-white/30 mt-1">{orders.length} total orders</div>
                </div>
                <div className="glass rounded-2xl border border-white/[0.05] p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Package size={16} className="text-accent-gold" />
                        <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Items Sold</span>
                    </div>
                    <div className="text-3xl font-mono text-white">{totalItems}</div>
                    <div className="text-xs text-white/30 mt-1">across all product types</div>
                </div>
                <div className="glass rounded-2xl border border-white/[0.05] p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Users size={16} className="text-accent-gold" />
                        <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Buying Members</span>
                    </div>
                    <div className="text-3xl font-mono text-white">{uniqueMembers}</div>
                    <div className="text-xs text-white/30 mt-1">unique purchasers</div>
                </div>
            </div>

            {/* Interactive Orders Table */}
            {orders.length === 0 ? (
                <div className="glass rounded-2xl border border-white/[0.05] h-48 flex flex-col items-center justify-center gap-3">
                    <ShoppingBag size={28} className="text-white/20" />
                    <p className="text-white/30 text-sm">No orders received yet.</p>
                </div>
            ) : (
                <AdminOrdersTable orders={serialized} />
            )}
        </div>
    );
}
