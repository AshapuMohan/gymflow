"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Star, Package } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";

interface StoreProductCardProps {
    id: string;
    name: string;
    price: number;
    category: string;
    description?: string | null;
    imageUrl?: string | null;
    inventory: number;
}

export default function StoreProductCard({ id, name, price, category, description, imageUrl, inventory }: StoreProductCardProps) {
    const addItem = useCartStore((s) => s.addItem);
    const openCart = useCartStore((s) => s.openCart);

    const handleAddToCart = () => {
        addItem({ id, name, price, category, imageUrl });
        openCart();
    };

    const isOutOfStock = inventory === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl border border-white/[0.05] hover:border-accent-gold/20 transition-colors overflow-hidden group flex flex-col"
        >
            {/* Product Image / Preview */}
            <div className="h-48 bg-white/[0.02] relative overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="flex flex-col items-center gap-2 opacity-30">
                        <Package size={40} />
                        <span className="text-[10px] uppercase tracking-wider">No Image</span>
                    </div>
                )}
                <div className="absolute top-4 left-4 px-2 py-1 glass rounded text-[10px] font-bold uppercase tracking-wider text-white/60 border border-white/[0.06]">
                    {category}
                </div>
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-xs uppercase tracking-[0.2em] text-red-400 font-bold">Out of Stock</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-display uppercase tracking-wide text-white leading-tight">{name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0">
                        <Star size={12} fill="currentColor" />
                        <span className="text-[10px] text-white/60">4.9</span>
                    </div>
                </div>

                {description && (
                    <p className="text-xs text-white/40 leading-relaxed mb-4 line-clamp-2">{description}</p>
                )}

                <div className="mt-auto flex items-center justify-between">
                    <div>
                        <div className="text-xl font-mono text-white">${price.toFixed(2)}</div>
                        {inventory < 10 && inventory > 0 && (
                            <div className="text-[10px] text-amber-400 mt-0.5">Only {inventory} left</div>
                        )}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className="w-10 h-10 bg-accent-gold text-background rounded-xl flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ShoppingCart size={18} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
