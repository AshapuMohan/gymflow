"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight, Lock } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
    const { items, isOpen, closeCart, removeItem, updateQuantity, total, count } = useCartStore();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const router = useRouter();

    // Check auth status via a lightweight session fetch - avoids useSession/SessionProvider
    useEffect(() => {
        fetch("/api/auth/session")
            .then(r => r.json())
            .then(data => setIsLoggedIn(!!data?.user))
            .catch(() => setIsLoggedIn(false));
    }, []);

    const handleCheckout = () => {
        if (items.length === 0) return;

        closeCart();

        if (!isLoggedIn) {
            // Guest → save cart (Zustand persist in localStorage) → login → /checkout
            router.push(`/login?callbackUrl=${encodeURIComponent("/checkout")}`);
        } else {
            // Logged in → go to checkout page to fill payment details
            router.push("/checkout");
        }
    };

    return (
        <>
            {/* Floating Cart Button */}
            <button
                onClick={() => useCartStore.getState().toggleCart()}
                className="fixed bottom-8 right-8 w-14 h-14 bg-accent-gold text-background rounded-full flex items-center justify-center shadow-2xl z-50 hover:scale-110 transition-transform"
            >
                <ShoppingCart size={22} />
                {count() > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-background text-[10px] font-bold rounded-full flex items-center justify-center">
                        {count()}
                    </span>
                )}
            </button>

            {/* Slide-over Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeCart}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full max-w-md glass z-[70] p-8 flex flex-col border-l border-white/[0.05]"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-xl font-display uppercase tracking-widest text-white">Arsenal Cart</h2>
                                    <p className="text-xs text-white/40">{count()} item{count() !== 1 ? "s" : ""}</p>
                                </div>
                                <button onClick={closeCart} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={20} className="text-white/60" />
                                </button>
                            </div>

                            {items.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                                    <ShoppingCart size={32} className="text-white/20" />
                                    <p className="text-white/30 text-sm">Your cart is empty.</p>
                                    <button onClick={closeCart} className="text-xs text-accent-gold underline underline-offset-4">
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 overflow-y-auto space-y-4 -mx-2 px-2">
                                        {items.map((item) => (
                                            <div key={item.id} className="glass rounded-xl border border-white/[0.05] p-4 flex gap-4">
                                                <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden text-2xl">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                                    ) : "🏋️"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm text-white font-medium truncate">{item.name}</div>
                                                    <div className="text-xs text-white/40 uppercase tracking-wider">{item.category}</div>
                                                    <div className="text-sm text-accent-gold font-mono mt-1">${item.price.toFixed(2)}</div>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <div className="flex items-center gap-2 glass rounded-full px-2 py-0.5">
                                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-white/60 hover:text-white"><Minus size={12} /></button>
                                                            <span className="text-xs text-white w-4 text-center">{item.quantity}</span>
                                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-white/60 hover:text-white"><Plus size={12} /></button>
                                                        </div>
                                                        <button onClick={() => removeItem(item.id)} className="text-white/30 hover:text-red-400 transition-colors">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-white font-mono self-start">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-white/[0.05]">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs uppercase tracking-wider text-white/40">Subtotal</span>
                                            <span className="text-xl font-mono text-white">${total().toFixed(2)}</span>
                                        </div>

                                        {!isLoggedIn && isLoggedIn !== null && (
                                            <div className="flex items-center gap-2 text-[10px] text-white/30 mb-3 px-1">
                                                <Lock size={10} />
                                                <span>You'll be asked to log in — your cart will be saved</span>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleCheckout}
                                            disabled={isLoggedIn === null}
                                            className="w-full py-4 bg-white text-background rounded-lg text-xs uppercase tracking-[0.15em] font-bold flex items-center justify-center gap-2 hover:bg-accent-gold transition-colors disabled:opacity-50"
                                        >
                                            {!isLoggedIn ? "Login to Checkout" : "Proceed to Checkout"}
                                            <ArrowRight size={14} />
                                        </button>
                                        <p className="text-[10px] text-white/20 text-center mt-3">
                                            {isLoggedIn ? "Secure checkout" : "Cart is saved automatically"}
                                        </p>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
