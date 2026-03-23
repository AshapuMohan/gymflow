"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const WORDS = ["DISCIPLINE.", "POWER.", "PRECISION.", "LEGACY."];

export default function TitanPhilosophy() {
    const containerRef = useRef<HTMLDivElement>(null);
    const wordsRef = useRef<(HTMLHeadingElement | null)[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Timeline for the scroll-driven storytelling
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "+=300%", // Pin for longer scroll to let words sequence
                pin: true,
                scrub: 1,
            },
        });

        // Fade in words sequentially
        wordsRef.current.forEach((word, i) => {
            if (word) {
                const startTime = i * 2.5; // absolute start time for this word
                tl.fromTo(
                    word,
                    { opacity: 0, y: 50, scale: 0.9 },
                    { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power2.out" },
                    startTime
                ).to(
                    word,
                    { opacity: 0, duration: 1, ease: "power2.in" },
                    startTime + 1.5 // fade out tightly before the next word comes
                );
            }
        });

        // Background color subtle shift mapped to timeline
        tl.to(
            containerRef.current,
            {
                backgroundColor: "#0A0A0A", // Very slight shifts in the dark tone
                duration: tl.duration(),
            },
            0
        );

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative w-full h-screen bg-[#050505] flex items-center justify-center overflow-hidden"
            id="protocol"
        >
            {/* Background grain or subtle texture could go here */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-gold/[0.02] to-transparent pointer-events-none" />

            <div className="flex flex-col items-center justify-center w-full z-10 px-6">
                {WORDS.map((word, idx) => (
                    <h2
                        key={word}
                        ref={(el) => {
                            wordsRef.current[idx] = el;
                        }}
                        className="absolute font-display font-semibold uppercase text-center text-5xl md:text-8xl lg:text-[140px] leading-none tracking-[-0.04em] text-foreground mix-blend-difference"
                        style={{ opacity: 0 }}
                    >
                        {word}
                    </h2>
                ))}
            </div>
        </section>
    );
}
