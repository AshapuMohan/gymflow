import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ShoppingBag, CheckCircle, Package, Truck, Home } from "lucide-react";
import OrderStatusPoller from "@/components/store/OrderStatusPoller";

const TRACKING_STEPS = [
    { key: "PENDING", label: "Order Placed", icon: CheckCircle, desc: "We received your order" },
    { key: "PROCESSING", label: "Processing", icon: Package, desc: "Your items are being prepared" },
    { key: "SHIPPED", label: "Shipped", icon: Truck, desc: "Your order is on the way" },
    { key: "DELIVERED", label: "Delivered", icon: Home, desc: "Order arrived successfully" },
];

// Maps statuses to completed step index (0-based)
const STATUS_INDEX: Record<string, number> = {
    PENDING: 0, COMPLETED: 0, PROCESSING: 1, SHIPPED: 2, DELIVERED: 3
};

export default async function MemberOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; orderId?: string }>;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const params = await searchParams;
    const justOrdered = params?.success === "true";

    const orders = await prisma.order.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
            items: {
                include: { product: { select: { name: true, imageUrl: true } } }
            }
        }
    });

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-display uppercase tracking-wider text-white">Arsenal Deployments</h1>
                <OrderStatusPoller />
            </div>
            <p className="text-white/40 font-sans text-sm mb-8">Your complete order and delivery history.</p>

            {/* Success banner */}
            {justOrdered && (
                <div className="mb-8 glass border border-green-500/30 bg-green-500/5 rounded-2xl p-5 flex items-center gap-4">
                    <CheckCircle className="text-green-400 flex-shrink-0" size={20} />
                    <div>
                        <p className="text-green-400 text-sm font-bold">Order placed successfully!</p>
                        <p className="text-white/40 text-xs mt-0.5">You'll receive a confirmation shortly. Track your order below.</p>
                    </div>
                    <a href="/store" className="ml-auto text-xs text-accent-gold underline underline-offset-4 whitespace-nowrap hover:text-white transition-colors">
                        Shop More
                    </a>
                </div>
            )}

            {orders.length === 0 ? (
                <div className="glass rounded-2xl border border-white/[0.05] h-64 flex flex-col items-center justify-center gap-4">
                    <ShoppingBag className="text-white/20" size={32} />
                    <p className="text-white/30 font-sans text-sm">No orders placed yet.</p>
                    <a href="/store" className="text-xs text-accent-gold underline underline-offset-4 decoration-accent-gold/30 hover:text-white transition-colors">
                        Visit the Arsenal Store
                    </a>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => {
                        const stepIdx = STATUS_INDEX[order.status] ?? 0;

                        return (
                            <div key={order.id} className="glass rounded-2xl border border-white/[0.05] overflow-hidden">
                                {/* Order header */}
                                <div className="p-6 border-b border-white/[0.05] flex items-start justify-between">
                                    <div>
                                        <div className="text-xs text-white/40 mb-1">Order</div>
                                        <div className="text-sm text-white font-mono">{order.id.slice(0, 12)}...</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-white/40 mb-1">{format(new Date(order.createdAt), "MMM dd, yyyy · HH:mm")}</div>
                                        <span className={`text-[10px] uppercase px-2 py-1 rounded font-bold ${order.status === "COMPLETED" || order.status === "PAID"
                                            ? "bg-green-500/10 text-green-400"
                                            : order.status === "SHIPPED"
                                                ? "bg-blue-500/10 text-blue-400"
                                                : order.status === "DELIVERED"
                                                    ? "bg-white/10 text-white/60"
                                                    : "bg-amber-500/10 text-amber-400"
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Tracking stepper */}
                                <div className="px-6 py-5 border-b border-white/[0.05]">
                                    <div className="flex items-center gap-0 w-full">
                                        {TRACKING_STEPS.map((step, i) => {
                                            const isCompleted = i <= stepIdx;
                                            const isActive = i === stepIdx;
                                            const Icon = step.icon;
                                            return (
                                                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isActive
                                                            ? "bg-accent-gold text-background"
                                                            : isCompleted
                                                                ? "bg-accent-gold/20 text-accent-gold"
                                                                : "bg-white/5 text-white/20"
                                                            }`}>
                                                            <Icon size={14} />
                                                        </div>
                                                        <div className={`text-[9px] uppercase tracking-wider mt-1.5 text-center w-16 ${isCompleted ? "text-accent-gold" : "text-white/20"}`}>
                                                            {step.label}
                                                        </div>
                                                    </div>
                                                    {i < TRACKING_STEPS.length - 1 && (
                                                        <div className={`h-[1px] flex-1 mx-1 mb-5 ${i < stepIdx ? "bg-accent-gold/40" : "bg-white/[0.06]"}`} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="p-6 space-y-3">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/[0.05]">
                                                {item.product?.imageUrl ? (
                                                    <img src={item.product.imageUrl} alt={item.product.name || ""} className="w-full h-full object-cover" />
                                                ) : "🏋️"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm text-white truncate">{item.product?.name}</div>
                                                <div className="text-xs text-white/30">Qty: {item.quantity}</div>
                                            </div>
                                            <div className="text-sm text-white font-mono flex-shrink-0">
                                                ${((item.priceAt ?? 0) * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Total and Actions */}
                                <div className="px-6 py-4 border-t border-white/[0.05] flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white/[0.01]">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs uppercase tracking-wider text-white/40">Order Total</span>
                                        <span className="text-white font-mono font-bold text-lg">${order.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {order.trackingNumber && (
                                            <div className="flex flex-col items-end border-r border-white/10 pr-4">
                                                <span className="text-[10px] uppercase tracking-wider text-white/40 mb-0.5">Tracking No.</span>
                                                <span className="text-xs font-mono text-accent-gold bg-accent-gold/10 px-2 rounded">{order.trackingNumber}</span>
                                            </div>
                                        )}
                                        <a
                                            href={`/dashboard/orders/${order.id}/invoice`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded bg-white/5 border border-white/10 text-white/70 hover:bg-white hover:text-black transition-colors"
                                        >
                                            Invoice PDF
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
