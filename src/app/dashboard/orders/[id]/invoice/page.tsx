import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function InvoicePage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            user: true,
            items: {
                include: { product: true }
            }
        }
    });

    if (!order || order.userId !== session.user.id) {
        return (
            <div className="w-full flex justify-center p-20 text-white font-mono">
                Order not found or unauthorized.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black font-sans p-8 md:p-16 print:p-0 print:bg-transparent">
            <div className="max-w-3xl mx-auto border border-gray-200 p-10 md:p-16 rounded-xl print:border-none print:shadow-none bg-white shadow-xl relative">

                {/* Header */}
                <div className="flex justify-between items-start mb-16 border-b border-gray-200 pb-8">
                    <div>
                        <h1 className="text-4xl font-display uppercase tracking-widest mb-2 font-black">GYMFLOW</h1>
                        <p className="text-sm text-gray-500 font-mono">1-800-GYM-FLOW</p>
                        <p className="text-sm text-gray-500 font-mono">shop@gymflow.com</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-light tracking-wider uppercase mb-2">INVOICE</h2>
                        <div className="text-sm font-mono text-gray-500 mb-1">Date: {format(new Date(order.createdAt), "MMM dd, yyyy")}</div>
                        <div className="text-sm font-mono text-gray-500">Order #: {order.id.slice(0, 12)}</div>
                    </div>
                </div>

                {/* Bill To */}
                <div className="mb-12">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-3 border-b border-gray-100 pb-2">Billed To</h3>
                    <p className="text-base font-bold text-gray-800">{order.user?.name || "Member"}</p>
                    <p className="text-sm font-mono text-gray-600 mt-1">{order.user?.email}</p>
                </div>

                {/* Items */}
                <table className="w-full text-left mb-16 border-collapse">
                    <thead>
                        <tr>
                            <th className="border-b-2 border-gray-200 py-3 text-xs uppercase tracking-[0.1em] text-gray-500">Item Description</th>
                            <th className="border-b-2 border-gray-200 py-3 text-xs uppercase tracking-[0.1em] text-gray-500 text-center">Qty</th>
                            <th className="border-b-2 border-gray-200 py-3 text-xs uppercase tracking-[0.1em] text-gray-500 text-right">Price</th>
                            <th className="border-b-2 border-gray-200 py-3 text-xs uppercase tracking-[0.1em] text-gray-500 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item) => (
                            <tr key={item.id}>
                                <td className="py-4 border-b border-gray-100 font-medium">
                                    {item.product?.name || "Unknown Product"}
                                </td>
                                <td className="py-4 border-b border-gray-100 text-center font-mono">
                                    {item.quantity}
                                </td>
                                <td className="py-4 border-b border-gray-100 text-right font-mono">
                                    ${(item.priceAt ?? 0).toFixed(2)}
                                </td>
                                <td className="py-4 border-b border-gray-100 text-right font-mono font-bold">
                                    ${((item.priceAt ?? 0) * item.quantity).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-16">
                    <div className="w-64 border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500 uppercase tracking-wider">Subtotal</span>
                            <span className="font-mono text-gray-600">${order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-500 uppercase tracking-wider">Tax (0%)</span>
                            <span className="font-mono text-gray-600">$0.00</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                            <span className="text-base font-bold uppercase tracking-wider">Total</span>
                            <span className="font-mono font-black text-xl">${order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Tracking & Status */}
                <div className="bg-gray-50 p-6 rounded relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-black"></div>
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Order Status</span>
                            <span className="text-sm font-bold tracking-wider uppercase text-gray-800">{order.status}</span>
                        </div>
                        {order.trackingNumber && (
                            <div className="text-right">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Tracking Number</span>
                                <span className="text-sm font-mono tracking-wider font-bold text-gray-800">{order.trackingNumber}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Print button (hidden on print) */}
                <div className="absolute top-0 right-[-100px] print:hidden hidden lg:block">
                    <button onClick={() => {/* Will be handled by raw script to open dialog seamlessly */ }} className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition shadow-xl" title="Print Invoice">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    </button>
                    <script dangerouslySetInnerHTML={{
                        __html: `
                        // Add click listener to the button
                        document.querySelector('button[title="Print Invoice"]')?.addEventListener('click', () => window.print());
                        
                        // Auto print on load
                        setTimeout(() => {
                            window.print();
                        }, 800);
                    `}} />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white !important; }
                    ::-webkit-scrollbar { display: none; }
                }
            `}} />
        </div>
    );
}
