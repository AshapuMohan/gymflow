"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
    classId: string;
    isBooked: boolean;
    isFull: boolean;
}

export default function BookClassButton({ classId, isBooked, isFull }: Props) {
    const [loading, setLoading] = useState(false);

    const handleBook = async () => {
        if (isBooked || isFull) return;
        setLoading(true);

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url; // Stripe checkout or success redirect
            } else {
                alert(data.message || 'Error booking class');
                setLoading(false);
            }
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    }

    if (isBooked) {
        return (
            <button disabled className="text-xs uppercase tracking-widest font-bold px-4 py-2 rounded bg-white/10 text-white/40 cursor-not-allowed">
                Booked
            </button>
        );
    }

    if (isFull) {
        return (
            <button disabled className="text-xs uppercase tracking-widest font-bold px-4 py-2 rounded bg-red-500/10 text-red-500/50 cursor-not-allowed">
                Full
            </button>
        );
    }

    return (
        <button
            onClick={handleBook}
            disabled={loading}
            className="text-xs uppercase tracking-widest font-bold px-4 py-2 rounded transition-colors bg-accent-gold text-background hover:bg-white flex items-center gap-2"
        >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            {loading ? "Processing..." : "Book Now"}
        </button>
    );
}
