"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

export default function SaasBillingClient() {
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/checkout/subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'saas' })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.message || 'Error subscribing');
                setLoading(false);
            }
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-4 bg-accent-gold hover:bg-white text-black text-xs uppercase tracking-[0.2em] font-bold rounded flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
        >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
            {loading ? "Processing..." : "Subscribe Now - $99/mo"}
        </button>
    );
}
