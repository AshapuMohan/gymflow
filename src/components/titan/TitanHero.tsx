"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Dynamically import the Canvas so Turbopack never SSR-bundles @react-three/drei
const HeroCanvas = dynamic(() => import("./HeroCanvas"), {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-background" />,
});

// Register GSAP ScrollTrigger
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function TitanHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;

        // We create a GSAP ScrollTrigger to track the progress of this section
        // and pass it down to the Three.js canvas.
        const st = ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top top",
            end: "+=100%", // Use relative end for pinned elements
            scrub: 1,
            pin: true, // Pin the section while scrolling through it
            onUpdate: (self) => {
                setScrollProgress(self.progress);
            },
        });

        return () => {
            st.kill();
        };
    }, []);

    return (
        <section ref={containerRef} className="relative w-full h-screen overflow-hidden bg-background">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <HeroCanvas scrollProgress={scrollProgress} />
            </div>

            {/* HTML Overlay Content */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full pointer-events-auto">
                <h1
                    className="font-display font-semibold uppercase text-center text-[48px] md:text-[120px] leading-none tracking-[-0.04em] text-foreground mix-blend-difference"
                    style={{
                        opacity: 1 - scrollProgress * 3, // Fade out early
                        transform: `translateY(${scrollProgress * 200}px)`
                    }}
                >
                    Titan Protocol
                </h1>
                <p
                    className="mt-6 text-lg tracking-[0.02em] leading-[1.6] text-white/70 max-w-md text-center font-sans mix-blend-difference"
                    style={{
                        opacity: 1 - scrollProgress * 4,
                    }}
                >
                    A hyper-luxury ecosystem designed for the elite. Silence the noise, elevate your performance.
                </p>

                {/* Call to action element (shown later in scroll or just fixed) */}
                <a
                    href="/login"
                    className="mt-12 px-8 py-4 border border-white/[0.08] rounded-full uppercase text-[14px] tracking-[0.1em] text-accent-gold glass transition-all duration-300 hover:bg-white/[0.05] hover:border-accent-gold/50 inline-block"
                    style={{
                        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                        opacity: 1 - scrollProgress * 4
                    }}
                >
                    Begin Ascent
                </a>
            </div>

            {/* Logo/SVG morph placeholder overlay */}
            <div
                className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
                style={{
                    opacity: scrollProgress > 0.5 ? Math.min(1, (scrollProgress - 0.5) * 2) : 0,
                }}
            >
                <svg viewBox="0 0 100 100" className="w-64 h-64 text-accent-gold drop-shadow-2xl">
                    <path fill="currentColor" d="M50 10 L90 90 L10 90 Z" />
                </svg>
            </div>

            {/* Progress indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/40">Scroll</span>
                <div className="w-[1px] h-12 bg-white/10 relative overflow-hidden">
                    <div
                        className="absolute top-0 left-0 w-full bg-accent-gold"
                        style={{ height: `${scrollProgress * 100}%` }}
                    />
                </div>
            </div>
        </section>
    );
}
