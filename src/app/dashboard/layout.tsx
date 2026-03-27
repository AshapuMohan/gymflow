import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, LayoutDashboard, Settings, ShoppingBag, CreditCard } from "lucide-react";
import DashboardSessionProvider from "./dashboard-session-provider";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const role = session.user?.role || "MEMBER";

    return (
        <DashboardSessionProvider>
        <div className="min-h-screen bg-background flex">
            {/* Sidebar Overlay for Mobile could go here */}

            {/* Static Sidebar */}
            <aside className="w-64 border-r border-white/[0.05] bg-surface/30 hidden md:flex flex-col">
                <div className="h-20 flex items-center px-6 border-b border-white/[0.05]">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-surface rounded-sm border border-white/[0.08]">
                            <div className="w-2 h-2 bg-accent-gold transform rotate-45" />
                        </div>
                        <span className="text-sm font-display tracking-widest uppercase text-white">TITAN X</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-2">
                    {role === "SUPERADMIN" ? (
                        <>
                            <SidebarItem href="/dashboard/admin" icon={<LayoutDashboard size={18} />} label="Analytics" />
                            <SidebarItem href="/dashboard/admin/orders" icon={<ShoppingBag size={18} />} label="Orders" />
                            <SidebarItem href="/dashboard/admin/users" icon={<Settings size={18} />} label="User Management" />
                            <SidebarItem href="/dashboard/admin/products" icon={<ShoppingBag size={18} />} label="Arsenal control" />
                            <SidebarItem href="/dashboard/admin/billing" icon={<CreditCard size={18} />} label="Revenue" />
                        </>
                    ) : role === "GYMADMIN" ? (
                        <>
                            <SidebarItem href="/dashboard/branch" icon={<LayoutDashboard size={18} />} label="Branch Analytics" />
                            <SidebarItem href="/dashboard/branch/orders" icon={<ShoppingBag size={18} />} label="Orders" />
                            <SidebarItem href="/dashboard/branch/members" icon={<Settings size={18} />} label="Members" />
                            <SidebarItem href="/dashboard/branch/plans" icon={<Settings size={18} />} label="Plans" />
                            <SidebarItem href="/dashboard/branch/schedule" icon={<CreditCard size={18} />} label="Classes" />
                            <SidebarItem href="/dashboard/branch/store" icon={<ShoppingBag size={18} />} label="Store" />
                        </>
                    ) : (
                        <>
                            <SidebarItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Overview" />
                            <SidebarItem href="/store" icon={<ShoppingBag size={18} />} label="Equipment Store" />
                            <SidebarItem href="/dashboard/orders" icon={<ShoppingBag size={18} />} label="Order History" />
                            <SidebarItem href="/dashboard/classes" icon={<CreditCard size={18} />} label="Classes" />
                            <SidebarItem href="/dashboard/billing" icon={<CreditCard size={18} />} label="Subscription" />
                            <SidebarItem href="/dashboard/settings" icon={<Settings size={18} />} label="Profile" />
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-white/[0.05]">
                    <div className="flex items-center gap-3 px-2 py-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white">
                            {session.user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-white font-medium">{session.user?.name}</span>
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">{role}</span>
                        </div>
                    </div>
                    {/* Implement actual signOut button functionality here in client component later */}
                    <Link href="/api/auth/signout" className="flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white transition-colors mt-2 rounded-lg hover:bg-white/5 text-xs uppercase tracking-wider font-medium">
                        <LogOut size={16} />
                        Sign Out
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col">
                {/* Top Header Mobile */}
                <header className="h-20 border-b border-white/[0.05] flex md:hidden items-center px-6 bg-surface/30">
                    <span className="text-sm font-display tracking-widest uppercase text-white">TITAN X</span>
                </header>

                {/* Content View */}
                <div className="p-8 md:p-12 flex-1 overflow-y-auto w-full max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

        </div>
        </DashboardSessionProvider>
    );
}

function SidebarItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
            <span className="text-accent-gold/50">{icon}</span>
            <span className="text-xs uppercase tracking-wider font-medium">{label}</span>
        </Link>
    )
}
