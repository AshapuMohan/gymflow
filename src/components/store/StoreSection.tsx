"use client";

import React from 'react';
import ProductCard from './ProductCard';

const products = [
    { name: "IRON CORE Dumbbell", price: 89.99, category: "Dumbbells" },
    { name: "Neon LED Barbell", price: 199.99, category: "Barbells" },
    { name: "Pro Resistance Band", price: 29.99, category: "Accessories" },
    { name: "Cyber Protein 2KG", price: 59.99, category: "Supplements" },
    { name: "Flux Gym Tee", price: 34.99, category: "Apparel" },
    { name: "Deep Core Mat", price: 44.99, category: "Accessories" }
];

export default function StoreSection() {
    return (
        <section id="shop" className="py-40 bg-neutral-950">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                    <div className="space-y-4">
                        <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">
                            FLUX <span className="text-neon-red">STORE</span>
                        </h2>
                        <p className="text-neutral-400 uppercase tracking-widest font-bold">Premium gear for elite performance</p>
                    </div>
                    <div className="flex gap-4 glass p-2 rounded-full">
                        {['All', 'Gear', 'Supps', 'Apparel'].map((c, i) => (
                            <button key={i} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-white text-black' : 'hover:bg-white/5'}`}>
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {products.map((p, i) => (
                        <ProductCard key={i} {...p} />
                    ))}
                </div>
            </div>
        </section>
    );
}
