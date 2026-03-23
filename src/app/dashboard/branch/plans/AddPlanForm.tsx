"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AddPlanForm() {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const price = formData.get("price") as string;
        const interval = formData.get("interval") as string;
        const features = formData.get("features") as string;

        try {
            const res = await fetch("/api/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, price, interval, features })
            });

            if (res.ok) {
                setOpen(false);
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to create plan");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="px-4 py-2 bg-accent-gold text-background font-bold text-xs uppercase tracking-wider rounded hover:bg-transparent hover:text-accent-gold border border-accent-gold transition-colors"
            >
                Create Plan
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-white/10 rounded-xl p-8 max-w-md w-full relative">
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4 text-white/40 hover:text-white"
                >
                    ✕
                </button>
                <h2 className="text-xl font-display uppercase tracking-widest text-white mb-6">Create Membership Plan</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Plan Name (e.g., TITAN X PRO)</label>
                        <input name="name" required className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-accent-gold outline-none transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Price (USD)</label>
                            <input name="price" type="number" step="0.01" required className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-accent-gold outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Interval</label>
                            <select name="interval" required className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-accent-gold outline-none transition-colors">
                                <option value="month">Monthly</option>
                                <option value="year">Yearly</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Features (comma separated)</label>
                        <input name="features" placeholder="24/7 Access, Personal Trainer, Sauna" className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-accent-gold outline-none transition-colors" />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 mt-4 bg-accent-gold text-background font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 hover:bg-white transition-colors"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Creating..." : "Save Plan"}
                    </button>
                </form>
            </div>
        </div>
    );
}
