"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cartStore";
import { Lock, CreditCard, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";

// Simple card number formatter: adds spaces every 4 digits
function formatCard(val: string) {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, total, clearCart } = useCartStore();

    const [step, setStep] = useState<"form" | "processing" | "done">("form");
    const [error, setError] = useState("");

    // Payment fields
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [cardName, setCardName] = useState("");
    const [email, setEmail] = useState("");

    // Billing address
    const [address, setAddress] = useState({ line1: "", city: "", state: "", zip: "", country: "US" });

    const validate = () => {
        if (!cardName.trim()) { setError("Please enter the cardholder name."); return false; }
        if (cardNumber.replace(/\s/g, "").length < 16) { setError("Please enter a valid 16-digit card number."); return false; }
        if (expiry.length < 5) { setError("Please enter a valid expiry date (MM/YY)."); return false; }
        if (cvv.length < 3) { setError("Please enter a valid CVV."); return false; }
        if (!email.includes("@")) { setError("Please enter a valid email."); return false; }
        if (!address.line1.trim() || !address.city.trim() || !address.zip.trim()) {
            setError("Please fill in all billing address fields.");
            return false;
        }
        // Check expiry not in past
        const [mm, yy] = expiry.split("/").map(Number);
        const now = new Date();
        const expDate = new Date(2000 + yy, mm - 1);
        if (expDate < now) { setError("Your card has expired."); return false; }
        return true;
    };

    const handlePay = async () => {
        setError("");
        if (!validate()) return;
        if (items.length === 0) { setError("Your cart is empty."); return; }

        setStep("processing");

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
                    email,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Payment failed. Please try again.");
                setStep("form");
                return;
            }

            // If real Stripe → redirect to Stripe hosted page
            if (data.url && !data.mock) {
                clearCart();
                window.location.href = data.url;
                return;
            }

            // Mock payment — show success then redirect
            clearCart();
            setStep("done");
            setTimeout(() => router.push(data.url || "/dashboard/orders?success=true"), 2500);
        } catch {
            setError("Network error. Please try again.");
            setStep("form");
        }
    };

    // Redirect to store if cart is somehow empty on load (e.g. direct URL access)
    useEffect(() => {
        if (items.length === 0 && step === "form") {
            router.push("/store");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Processing overlay ─────────────────────────── */
    if (step === "processing") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                    <p className="text-white font-display uppercase tracking-widest text-lg">Processing Payment</p>
                    <p className="text-white/30 text-sm mt-2">Please do not close this page…</p>
                </div>
            </div>
        );
    }

    /* ── Success overlay ────────────────────────────── */
    if (step === "done") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <CheckCircle size={56} className="text-green-400 mx-auto mb-6" />
                    <p className="text-white font-display uppercase tracking-widest text-xl">Payment Confirmed!</p>
                    <p className="text-white/40 text-sm mt-2">Redirecting to your orders…</p>
                </div>
            </div>
        );
    }

    /* ── Checkout Form ──────────────────────────────── */
    return (
        <div className="min-h-screen bg-background pt-12 pb-20 px-4">
            {/* Background glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-accent-gold/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-10">
                    <a href="/store" className="text-white/30 hover:text-white text-xs uppercase tracking-wider transition-colors">Store</a>
                    <ChevronRight size={14} className="text-white/20" />
                    <span className="text-accent-gold text-xs uppercase tracking-wider">Secure Checkout</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* ── Left: Payment Form ── */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Contact */}
                        <div className="glass rounded-2xl border border-white/[0.05] p-6">
                            <h2 className="text-xs uppercase tracking-[0.2em] text-white/50 font-bold mb-5">Contact</h2>
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-surface/40 border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-accent-gold/50 transition-colors"
                            />
                        </div>

                        {/* Card Details */}
                        <div className="glass rounded-2xl border border-white/[0.05] p-6">
                            <h2 className="text-xs uppercase tracking-[0.2em] text-white/50 font-bold mb-5 flex items-center gap-2">
                                <CreditCard size={14} className="text-accent-gold" />
                                Card Details
                            </h2>

                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Cardholder name"
                                    value={cardName}
                                    onChange={e => setCardName(e.target.value)}
                                    className="w-full bg-surface/40 border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-accent-gold/50 transition-colors"
                                />
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="1234 5678 9012 3456"
                                        value={cardNumber}
                                        onChange={e => setCardNumber(formatCard(e.target.value))}
                                        maxLength={19}
                                        className="w-full bg-surface/40 border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-accent-gold/50 transition-colors pr-16"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-xs">
                                        {cardNumber.startsWith("4") ? "VISA" : cardNumber.startsWith("5") ? "MC" : "CARD"}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="MM/YY"
                                        value={expiry}
                                        onChange={e => setExpiry(formatExpiry(e.target.value))}
                                        maxLength={5}
                                        className="bg-surface/40 border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-accent-gold/50 transition-colors"
                                    />
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        placeholder="CVV"
                                        value={cvv}
                                        onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                        className="bg-surface/40 border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-accent-gold/50 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Billing Address */}
                        <div className="glass rounded-2xl border border-white/[0.05] p-6">
                            <h2 className="text-xs uppercase tracking-[0.2em] text-white/50 font-bold mb-5">Billing Address</h2>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Street address"
                                    value={address.line1}
                                    onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))}
                                    className="w-full bg-surface/40 border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-accent-gold/50 transition-colors"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={address.city}
                                        onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                                        className="bg-surface/40 border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-accent-gold/50 transition-colors"
                                    />
                                    <input
                                        type="text"
                                        placeholder="State"
                                        value={address.state}
                                        onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
                                        className="bg-surface/40 border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-accent-gold/50 transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="ZIP / Postal code"
                                        value={address.zip}
                                        onChange={e => setAddress(a => ({ ...a, zip: e.target.value }))}
                                        className="bg-surface/40 border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-accent-gold/50 transition-colors"
                                    />
                                    <select
                                        value={address.country}
                                        onChange={e => setAddress(a => ({ ...a, country: e.target.value }))}
                                        className="bg-surface/40 border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-gold/50 transition-colors"
                                    >
                                        <option value="US">United States</option>
                                        <option value="IN">India</option>
                                        <option value="GB">United Kingdom</option>
                                        <option value="CA">Canada</option>
                                        <option value="AU">Australia</option>
                                        <option value="AE">UAE</option>
                                        <option value="SG">Singapore</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                <AlertCircle size={16} className="flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Pay Button */}
                        <button
                            onClick={handlePay}
                            className="w-full py-5 bg-accent-gold text-background font-display uppercase tracking-[0.15em] text-sm rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-3 group"
                        >
                            <Lock size={14} />
                            Pay ${total().toFixed(2)} Now
                        </button>

                        <p className="text-center text-[10px] text-white/20 flex items-center justify-center gap-2">
                            <Lock size={10} />
                            256-bit SSL encrypted · Your card data is never stored
                        </p>
                    </div>

                    {/* ── Right: Order Summary ── */}
                    <div className="lg:col-span-2">
                        <div className="glass rounded-2xl border border-white/[0.05] p-6 sticky top-8">
                            <h2 className="text-xs uppercase tracking-[0.2em] text-white/50 font-bold mb-5">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                {items.map(item => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex-shrink-0 overflow-hidden">
                                            {item.imageUrl
                                                ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                : <span className="flex items-center justify-center h-full text-xl">🏋️</span>
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-white truncate">{item.name}</div>
                                            <div className="text-xs text-white/30">Qty: {item.quantity}</div>
                                        </div>
                                        <div className="text-sm text-white font-mono flex-shrink-0">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-white/[0.05] pt-4 space-y-2">
                                <div className="flex justify-between text-xs text-white/40">
                                    <span>Subtotal</span>
                                    <span className="font-mono">${total().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-white/40">
                                    <span>Shipping</span>
                                    <span className="text-green-400">Free</span>
                                </div>
                                <div className="flex justify-between text-white font-bold mt-2 pt-2 border-t border-white/[0.05]">
                                    <span className="uppercase tracking-wider text-sm">Total</span>
                                    <span className="font-mono text-accent-gold text-lg">${total().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
