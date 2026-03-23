"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, RefreshCw } from "lucide-react";

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_COLOR: Record<string, string> = {
    COMPLETED: "bg-green-500/10 text-green-400 border-green-500/20",
    PAID: "bg-green-500/10 text-green-400 border-green-500/20",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    PROCESSING: "bg-blue-500/10  text-blue-400  border-blue-500/20",
    SHIPPED: "bg-sky-500/10   text-sky-400   border-sky-500/20",
    DELIVERED: "bg-white/10    text-white/60  border-white/10",
    CANCELLED: "bg-red-500/10  text-red-400   border-red-500/20",
};

interface OrderItem {
    id: string;
    quantity: number;
    priceAt: number;
    product: { name: string; imageUrl: string | null; category: string } | null;
}

interface Order {
    id: string;
    status: string;
    totalAmount: number;
    trackingNumber: string | null;
    createdAt: string | Date;
    user: { name: string | null; email: string | null } | null;
    items: OrderItem[];
}

interface Props {
    orders: Order[];
}

export default function AdminOrdersTable({ orders: initialOrders }: Props) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [updating, setUpdating] = useState<string | null>(null); // orderId being updated
    const [error, setError] = useState<string>("");

    const updateOrder = async (orderId: string, payload: any) => {
        setUpdating(orderId);
        setError("");
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || "Update failed");
                return;
            }

            // Optimistically update the local state
            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, ...payload } : o)
            );
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setUpdating(null);
        }
    };

    if (orders.length === 0) {
        return (
            <div className="glass rounded-2xl border border-white/[0.05] h-48 flex items-center justify-center">
                <p className="text-white/30 text-sm">No orders received yet.</p>
            </div>
        );
    }

    return (
        <>
            {error && (
                <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                    {error}
                </div>
            )}
            <div className="glass rounded-2xl border border-white/[0.05] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                                {["Order", "Member", "Items", "Total", "Tracking", "Status", "Date"].map(h => (
                                    <th key={h} className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">

                                    {/* Order ID */}
                                    <td className="px-5 py-4">
                                        <span className="text-[11px] font-mono text-white/50">{order.id.slice(0, 10)}…</span>
                                    </td>

                                    {/* Member — avatar + name (fallback to email) */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-[10px] font-bold text-accent-gold uppercase">
                                                    {(order.user?.name || order.user?.email || "?").charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-sm text-white font-medium">
                                                    {order.user?.name || order.user?.email?.split("@")[0] || "Unknown Member"}
                                                </div>
                                                <div className="text-xs text-white/30 truncate max-w-[140px]">{order.user?.email}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Items */}
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col gap-1.5 max-w-[220px]">
                                            {order.items.map(item => (
                                                <div key={item.id} className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded bg-white/5 border border-white/10 flex-shrink-0 overflow-hidden">
                                                        {item.product?.imageUrl ? (
                                                            <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="flex items-center justify-center h-full text-[8px] text-white/20">🏋</span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-white/70 truncate">
                                                        {item.product?.name}
                                                        <span className="text-white/30 ml-1">×{item.quantity}</span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>

                                    {/* Total */}
                                    <td className="px-5 py-4">
                                        <span className="text-sm font-mono text-accent-gold whitespace-nowrap">
                                            ${order.totalAmount.toFixed(2)}
                                        </span>
                                    </td>

                                    {/* Tracking */}
                                    <td className="px-5 py-4">
                                        <input
                                            type="text"
                                            placeholder="Enter tracking #"
                                            defaultValue={order.trackingNumber || ""}
                                            disabled={updating === order.id}
                                            onBlur={(e) => {
                                                if (e.target.value !== (order.trackingNumber || "")) {
                                                    updateOrder(order.id, { trackingNumber: e.target.value });
                                                }
                                            }}
                                            className="w-32 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-accent-gold outline-none transition-colors disabled:opacity-50"
                                        />
                                    </td>

                                    {/* Status — editable dropdown */}
                                    <td className="px-5 py-4">
                                        <div className="relative inline-flex items-center">
                                            <select
                                                value={order.status}
                                                disabled={updating === order.id}
                                                onChange={e => updateOrder(order.id, { status: e.target.value })}
                                                className={`
                                                    appearance-none pr-7 pl-2.5 py-1.5 rounded-full text-[10px] uppercase font-bold
                                                    tracking-wider border cursor-pointer transition-all
                                                    focus:outline-none focus:ring-1 focus:ring-accent-gold/40
                                                    disabled:opacity-50 disabled:cursor-wait
                                                    ${STATUS_COLOR[order.status] || "bg-white/10 text-white/50 border-white/10"}
                                                `}
                                                style={{ background: "transparent" }}
                                            >
                                                {/* Always show current status first even if it's COMPLETED/PAID */}
                                                {!STATUSES.includes(order.status) && (
                                                    <option value={order.status}>{order.status}</option>
                                                )}
                                                {STATUSES.map(s => (
                                                    <option key={s} value={s} className="bg-zinc-900 text-white">
                                                        {s}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="absolute right-2 pointer-events-none">
                                                {updating === order.id
                                                    ? <RefreshCw size={9} className="text-white/40 animate-spin" />
                                                    : <ChevronDown size={9} className="text-white/40" />
                                                }
                                            </span>
                                        </div>
                                    </td>

                                    {/* Date */}
                                    <td className="px-5 py-4">
                                        <div className="text-xs text-white/60 whitespace-nowrap">{format(new Date(order.createdAt), "MMM dd, yyyy")}</div>
                                        <div className="text-[10px] text-white/30">{format(new Date(order.createdAt), "HH:mm")}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
