"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Calendar,
    CreditCard,
    Settings,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Dumbbell,
    ShoppingBag,
    Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Shop', href: '/dashboard/shop', icon: ShoppingBag },
    { name: 'Orders', href: '/dashboard/orders', icon: Package },
    { name: 'Members', href: '/dashboard/members', icon: Users },
    { name: 'Classes', href: '/dashboard/classes', icon: Calendar },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <div className="flex h-screen bg-neutral-950 text-white overflow-hidden">
            {/* Sidebar */}
            <aside
                className={cn(
                    "relative flex flex-col border-r border-white/10 bg-black/20 backdrop-blur-xl transition-all duration-300",
                    isCollapsed ? "w-20" : "w-64"
                )}
            >
                <div className="flex items-center gap-3 p-6 h-20">
                    <div className="bg-neon-red p-2 rounded-lg neon-glow-red">
                        <Dumbbell size={24} className="text-white" />
                    </div>
                    {!isCollapsed && <span className="text-xl font-black tracking-tighter uppercase italic">IRON CORE</span>}
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group text-neutral-400 hover:text-white hover:bg-white/5",
                                    isActive && "text-white bg-white/10",
                                    isCollapsed && "justify-center px-0"
                                )}
                            >
                                <item.icon size={20} className={cn(isActive && "text-neon-red")} />
                                {!isCollapsed && <span className="font-medium">{item.name}</span>}
                                {isCollapsed && (
                                    <div className="absolute left-16 px-2 py-1 bg-neutral-900 border border-white/10 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={() => {/* Handle Logout */ }}
                        className={cn(
                            "flex items-center gap-3 w-full px-3 py-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all",
                            isCollapsed && "justify-center px-0"
                        )}
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span className="font-medium">Logout</span>}
                    </button>
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-24 bg-neon-red p-1 rounded-full border border-white/20 hover:scale-110 transition-transform neon-glow-red"
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Header */}
                <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md sticky top-0 z-10">
                    <h2 className="text-lg font-semibold text-neutral-200 uppercase tracking-wider">
                        {sidebarItems.find(i => i.href === pathname)?.name || 'Overview'}
                    </h2>
                    <div className="flex items-center gap-4">
                        {/* User Profile / Notifications */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-red to-electric-blue border border-white/20" />
                    </div>
                </header>

                <section className="p-8">
                    {children}
                </section>
            </main>
        </div>
    );
}
