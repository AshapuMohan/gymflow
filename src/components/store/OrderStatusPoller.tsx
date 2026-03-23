"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

/**
 * Mounts on the member orders page.
 * – Polls every 15 seconds via router.refresh() (re-runs the server component)
 * – Shows a manual "Refresh Status" button
 */
export default function OrderStatusPoller() {
    const router = useRouter();

    const refresh = useCallback(() => {
        router.refresh();
    }, [router]);

    // Auto-poll every 15 seconds
    useEffect(() => {
        const id = setInterval(refresh, 15_000);
        return () => clearInterval(id);
    }, [refresh]);

    return (
        <button
            onClick={refresh}
            className="flex items-center gap-2 text-xs text-white/30 hover:text-accent-gold transition-colors group"
            title="Refresh order status"
        >
            <RefreshCw size={12} className="group-hover:animate-spin" />
            Refresh Status
        </button>
    );
}
