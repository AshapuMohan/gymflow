"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
    planId: string;
    isCurrent: boolean;
    popular?: boolean;
}

export default function SubscribeButton({ planId, isCurrent, popular }: Props) {
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        if (isCurrent) return;
        setLoading(true);

        try {
            const res = await fetch('/api/checkout/subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'membership', membershipPlanId: planId })
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
            disabled={loading || isCurrent}
            className={`w-full py-3 flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${popular ? 'bg-accent-gold text-background hover:bg-white' : 'border border-white/20 text-white hover:border-accent-gold hover:text-accent-gold'} ${isCurrent ? 'bg-white/10 text-white/40 border-none hover:bg-white/10 hover:text-white/40' : ''}`}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isCurrent ? 'Current Plan' : (loading ? 'Processing...' : 'Select Plan')}
        </button>
    );
}
