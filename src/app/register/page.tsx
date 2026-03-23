"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                router.push("/login");
            } else {
                const data = await res.json();
                setError(data.message || "Registration failed. Please try again.");
            }
        } catch (err: any) {
            setError("An error occurred during registration.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 relative overflow-hidden py-12">

            {/* Background aesthetics */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center">
                <div className="w-[800px] h-[800px] bg-accent-gold/10 rounded-full blur-[150px]" />
            </div>

            <div className="w-full max-w-md z-10">

                {/* Logo Return */}
                <Link href="/" className="flex justify-center mb-8 group">
                    <div className="flex items-center justify-center w-12 h-12 bg-surface rounded-sm border border-white/[0.08] group-hover:border-accent-gold transition-colors duration-500">
                        <div className="w-4 h-4 bg-accent-gold transform rotate-45" />
                    </div>
                </Link>

                {/* Form Container */}
                <div className="glass p-8 md:p-12 rounded-2xl w-full border border-white/[0.05]">
                    <h1 className="text-2xl text-white font-sans font-medium tracking-tight mb-2 text-center">
                        Initiate Protocol
                    </h1>
                    <p className="text-white/40 text-sm mb-8 text-center font-sans tracking-wide">
                        Begin your ascent to elite status.
                    </p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6 text-center">
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-[0.1em] text-white/50 font-sans ml-1">
                                Full Designation
                            </label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-surface/50 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-gold/50 transition-colors font-sans"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-[0.1em] text-white/50 font-sans ml-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="athlete@titan.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-surface/50 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-gold/50 transition-colors font-sans"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-[0.1em] text-white/50 font-sans ml-1">
                                Create Passkey
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-surface/50 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-gold/50 transition-colors font-sans"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-4 bg-accent-gold text-background rounded-lg text-xs uppercase tracking-[0.1em] font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Processing..." : "Submit Application"}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-white/[0.05] pt-6">
                        <p className="text-xs text-white/40 font-sans">
                            Already enlisted?{" "}
                            <Link href="/login" className="text-white hover:text-accent-gold transition-colors">
                                Access your profile
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
