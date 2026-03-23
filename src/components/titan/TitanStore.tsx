"use client";

import { ShoppingBag } from "lucide-react";

// Placeholder data since we do not have a real CMS / API yet
const PRODUCTS = [
    {
        id: "dumbbells-1",
        name: "Titanium Elite Series Dumbbell",
        category: "Premium Equipment",
        price: "$499",
        image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2670&auto=format&fit=crop", // high quality stylized gym equipment
    },
    {
        id: "bands-1",
        name: "Aero-Resistance Bands",
        category: "Performance Gear",
        price: "$89",
        image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=2674&auto=format&fit=crop",
    },
    {
        id: "apparel-1",
        name: "Stealth Compression Tee",
        category: "Gym Apparel",
        price: "$120",
        image: "https://images.unsplash.com/photo-1596540608553-644cbafb43c6?q=80&w=2574&auto=format&fit=crop",
    },
    {
        id: "supplements-1",
        name: "Pre-Workout Apex Formula",
        category: "Supplements",
        price: "$65",
        image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=2670&auto=format&fit=crop",
    }
];

export default function TitanStore() {
    return (
        <section className="relative w-full py-32 bg-background flex flex-col items-center border-t border-white/[0.03]" id="performance">

            <div className="w-full max-w-7xl px-6 mb-16 flex flex-col md:flex-row justify-between items-end relative z-10">
                <div>
                    <span className="text-accent-gold text-xs font-sans uppercase tracking-[0.2em] mb-4 block">
                        Global Protocol Store
                    </span>
                    <h2 className="font-display text-4xl md:text-5xl tracking-[-0.04em] uppercase text-foreground">
                        Performance Engine
                    </h2>
                </div>

                <a
                    href="/store"
                    className="mt-6 md:mt-0 flex items-center gap-2 text-white/50 hover:text-white transition-colors uppercase tracking-[0.1em] text-xs font-semibold pb-1 border-b border-white/[0.1] hover:border-white"
                >
                    View All Arsenal
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full px-6 relative z-10">
                {PRODUCTS.map((item) => (
                    <div
                        key={item.id}
                        className="group flex flex-col cursor-pointer"
                    >
                        {/* Image Container with 3D/Zoom feeling */}
                        <div className="w-full aspect-[4/5] bg-surface rounded-xl overflow-hidden relative mb-4 glass border border-white/[0.05] group-hover:border-accent-gold/30 transition-all duration-500"
                            style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100 mix-blend-luminosity hover:mix-blend-normal"
                                style={{ backgroundImage: `url(${item.image})` }}
                            />

                            {/* Quick Add overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                                style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
                            >
                                <a href="/store" className="w-full py-3 bg-white/10 backdrop-blur-md rounded-lg text-white text-xs uppercase tracking-[0.1em] font-semibold flex items-center justify-center gap-2 hover:bg-white hover:text-background transition-colors">
                                    <ShoppingBag className="w-4 h-4" />
                                    Quick Add
                                </a>
                            </div>
                        </div>

                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-white/40 text-[10px] uppercase font-sans tracking-[0.1em]">
                                    {item.category}
                                </span>
                                <h3 className="text-white font-sans text-sm mt-1 group-hover:text-accent-gold transition-colors">
                                    {item.name}
                                </h3>
                            </div>
                            <span className="text-white/80 font-mono text-sm">
                                {item.price}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

        </section>
    );
}
