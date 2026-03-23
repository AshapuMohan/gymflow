"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Save, Bell, Lock, User } from "lucide-react";

export default function MemberSettingsPage() {
    const { data: session } = useSession();
    const [name, setName] = useState(session?.user?.name || "");
    const [saved, setSaved] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for PATCH /api/user/profile
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="w-full max-w-2xl">
            <h1 className="text-3xl font-display uppercase tracking-wider text-white mb-2">Profile Protocol</h1>
            <p className="text-white/40 font-sans text-sm mb-10">Manage your identity, security, and notification preferences.</p>

            {/* Personal Info */}
            <section className="glass rounded-2xl border border-white/[0.05] p-6 md:p-8 mb-6">
                <div className="flex items-center gap-2 mb-6">
                    <User size={14} className="text-accent-gold" />
                    <h2 className="text-xs uppercase tracking-[0.2em] text-white/60 font-bold">Identity</h2>
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-surface/50 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-gold/50 transition-colors font-sans text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">Email Address</label>
                        <input
                            type="email"
                            defaultValue={session?.user?.email || ""}
                            disabled
                            className="w-full bg-surface/20 border border-white/[0.04] rounded-lg px-4 py-3 text-white/30 font-sans text-sm cursor-not-allowed"
                        />
                        <p className="text-[10px] text-white/20 mt-1 ml-1">Email cannot be changed directly.</p>
                    </div>
                    <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-white text-background rounded text-xs uppercase tracking-wider font-bold hover:bg-accent-gold transition-colors">
                        <Save size={12} />
                        {saved ? "Saved!" : "Save Changes"}
                    </button>
                </form>
            </section>

            {/* Security */}
            <section className="glass rounded-2xl border border-white/[0.05] p-6 md:p-8 mb-6">
                <div className="flex items-center gap-2 mb-6">
                    <Lock size={14} className="text-accent-gold" />
                    <h2 className="text-xs uppercase tracking-[0.2em] text-white/60 font-bold">Security</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">New Passkey</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-surface/50 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-gold/50 transition-colors font-sans text-sm" />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">Confirm Passkey</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-surface/50 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-gold/50 transition-colors font-sans text-sm" />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-white/20 text-white rounded text-xs uppercase tracking-wider font-bold hover:border-accent-gold hover:text-accent-gold transition-colors">
                        Update Passkey
                    </button>
                </div>
            </section>

            {/* Notifications */}
            <section className="glass rounded-2xl border border-white/[0.05] p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                    <Bell size={14} className="text-accent-gold" />
                    <h2 className="text-xs uppercase tracking-[0.2em] text-white/60 font-bold">Notifications</h2>
                </div>
                <div className="space-y-4">
                    {[
                        ["Class reminders", "Get notified 1 hour before your enrolled class"],
                        ["Order updates", "Shipping and delivery notifications"],
                        ["Promotional offers", "Exclusive deals and new product drops"],
                    ].map(([label, desc]) => (
                        <div key={label} className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-sm text-white">{label}</div>
                                <div className="text-xs text-white/30">{desc}</div>
                            </div>
                            <button className="w-10 h-6 bg-accent-gold rounded-full flex-shrink-0 relative cursor-pointer">
                                <span className="absolute right-1 top-1 w-4 h-4 bg-background rounded-full shadow" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
