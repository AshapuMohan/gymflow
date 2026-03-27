"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Invalid credentials. Please try again.");
            } else if (res?.ok) {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (err) {
            setError("An error occurred during authentication.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 relative overflow-hidden">

            {/* Background aesthetics */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center">
                <div className="w-[800px] h-[800px] bg-accent-gold/20 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md z-10">

                {/* Logo Return */}
                <Link href="/" className="flex justify-center mb-12 group">
                    <div className="flex items-center justify-center w-12 h-12 bg-surface rounded-sm border border-white/[0.08] group-hover:border-accent-gold transition-colors duration-500">
                        <div className="w-4 h-4 bg-accent-gold transform rotate-45" />
                    </div>
                </Link>

                {/* Form Container */}
                <div className="glass p-8 md:p-12 rounded-2xl w-full border border-white/[0.05]">
                    <h1 className="text-2xl text-white font-sans font-medium tracking-tight mb-2 text-center">
                        Access Protocol
                    </h1>
                    <p className="text-white/40 text-sm mb-8 text-center font-sans tracking-wide">
                        Enter your credentials to continue
                    </p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6 text-center">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
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
                            <label className="text-[10px] uppercase tracking-[0.1em] text-white/50 font-sans ml-1 flex justify-between">
                                <span>Passkey</span>
                                <Link href="#" className="hover:text-accent-gold transition-colors">Reset</Link>
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
                            className="w-full py-4 bg-white text-background rounded-lg text-xs uppercase tracking-[0.1em] font-bold flex items-center justify-center gap-2 hover:bg-accent-gold transition-colors duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Authorizing..." : "Authorize"}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-white/[0.05] pt-6">
                        <p className="text-xs text-white/40 font-sans">
                            Not yet enlisted?{" "}
                            <Link href="/register" className="text-white hover:text-accent-gold transition-colors">
                                Initiate application
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
