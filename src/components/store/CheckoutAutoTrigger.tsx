"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/lib/cartStore";

export default function CheckoutAutoTrigger() {
    const searchParams = useSearchParams();
    const { items, openCart } = useCartStore();

    useEffect(() => {
        const shouldCheckout = searchParams.get("checkout") === "1";
        if (!shouldCheckout) return;

        // Verify session via fetch before opening cart
        fetch("/api/auth/session")
            .then(r => r.json())
            .then(data => {
                if (data?.user && items.length > 0) {
                    const timer = setTimeout(() => {
                        openCart();
                        const url = new URL(window.location.href);
                        url.searchParams.delete("checkout");
                        window.history.replaceState({}, "", url.toString());
                    }, 500);
                    return () => clearTimeout(timer);
                }
            })
            .catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
