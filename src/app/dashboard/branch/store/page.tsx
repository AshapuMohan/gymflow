"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import AddProductForm from "@/components/store/AddProductForm";

interface Product {
    id: string;
    name: string;
    category: string;
    sku: string;
    price: number;
    inventory: number;
    isActive: boolean;
    imageUrl?: string | null;
    createdAt: string;
}

export default function BranchProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch { setProducts([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProducts(); }, []);

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-display uppercase tracking-wider text-white mb-2">Branch Store</h1>
                    <p className="text-white/40 font-sans text-sm">Manage your branch product listings and inventory.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-accent-gold text-background font-bold text-xs uppercase tracking-wider rounded hover:bg-transparent hover:text-accent-gold border border-accent-gold transition-colors"
                >
                    + Add Product
                </button>
            </div>

            {showForm && <AddProductForm onClose={() => setShowForm(false)} onSuccess={fetchProducts} />}

            {loading ? (
                <div className="glass rounded-2xl border border-white/[0.05] h-48 flex items-center justify-center">
                    <p className="text-white/30 text-sm animate-pulse">Loading products...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="glass rounded-2xl border border-white/[0.05] h-64 flex flex-col items-center justify-center gap-4">
                    <p className="text-white/30 font-sans text-sm">No products listed yet.</p>
                    <button onClick={() => setShowForm(true)} className="text-xs text-accent-gold underline underline-offset-4">Add your first product</button>
                </div>
            ) : (
                <div className="glass rounded-2xl border border-white/[0.05] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                                    <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Product</th>
                                    <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Category</th>
                                    <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Price</th>
                                    <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Stock</th>
                                    <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white/20 text-lg">🏋️</div>
                                                )}
                                                <div>
                                                    <div className="text-sm text-white font-medium">{product.name}</div>
                                                    <div className="text-xs text-white/40">SKU: {product.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs text-white/60 uppercase tracking-wider">{product.category}</td>
                                        <td className="p-4 text-sm text-white font-mono">${product.price.toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className={`text-xs font-mono ${product.inventory < 10 ? 'text-red-400' : 'text-green-400'}`}>
                                                {product.inventory} units
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-3">
                                            <button className="text-xs text-accent-gold hover:text-white transition-colors">Edit</button>
                                            <button className="text-xs text-red-400/60 hover:text-red-400 transition-colors">Remove</button>
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
