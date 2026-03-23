"use client";

import React from "react";

const TIERS = [
    {
        name: "Foundation",
        price: "$29",
        period: "Per Month",
        description: "The baseline protocol for the self-guided athlete.",
        features: [
            "Full digital library access",
            "Core performance analytics",
            "Community forum access",
        ],
        buttonText: "Initiate Protocol",
        isPopular: false,
    },
    {
        name: "Apex",
        price: "$59",
        period: "Per Month",
        description: "Advanced systems + AI-driven nutrition tracking.",
        features: [
            "Everything in Foundation",
            "AI Nutrition & Macro Tracking",
            "Weekly performance reviews",
            "Early access to new modules",
        ],
        buttonText: "Unlock Apex",
        isPopular: true,
    },
    {
        name: "Titan Elite",
        price: "$99",
        period: "Per Month",
        description: "The absolute pinnacle of human performance optimization.",
        features: [
            "Everything in Apex",
            "1-on-1 Virtual Coaching",
            "Priority Titan Gear drops",
            "Bespoke macro-cycle programming",
        ],
        buttonText: "Apply For Elite",
        isPopular: false,
    },
];

function CheckIcon() {
    return (
        <svg
            className="w-5 h-5 text-accent-gold mr-3 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
        </svg>
    );
}

export default function TitanPricing() {
    return (
        <section className="relative w-full py-32 bg-background flex flex-col items-center">

            <div className="text-center mb-16 max-w-2xl px-6 relative z-10">
                <h2 className="font-display text-4xl md:text-6xl tracking-[-0.04em] uppercase text-foreground mb-4">
                    Select Your Protocol
                </h2>
                <p className="font-sans text-white/50 text-lg">
                    Zero friction. Maximum output. Choose the tier that aligns with your ambition.
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-6">
                {TIERS.map((tier) => (
                    <div
                        key={tier.name}
                        className={`
              glass p-8 rounded-2xl flex flex-col items-start w-full relative overflow-hidden transition-all duration-300 group hover:-translate-y-2
              ${tier.isPopular ? "border-accent-gold/40 shadow-[0_0_30px_rgba(178,151,98,0.1)]" : "border-white/[0.08] hover:border-white/20"}
            `}
                        style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
                    >
                        {tier.isPopular && (
                            <div className="absolute top-0 right-0 bg-accent-gold text-background text-[10px] uppercase font-bold tracking-[0.1em] px-3 py-1 rounded-bl-lg">
                                Recommended
                            </div>
                        )}

                        <h3 className="font-sans font-medium text-white text-xl mb-2">{tier.name}</h3>
                        <p className="font-sans text-white/50 text-sm mb-6 h-10">{tier.description}</p>

                        <div className="flex items-baseline mb-8">
                            <span className="font-display text-5xl text-white">{tier.price}</span>
                            <span className="font-sans text-white/40 ml-2 text-sm">{tier.period}</span>
                        </div>

                        <ul className="flex-1 space-y-4 mb-8 w-full">
                            {tier.features.map((feature, fIdx) => (
                                <li key={fIdx} className="flex items-center text-white/80 font-sans text-sm">
                                    <CheckIcon />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <a
                            href={`/login?plan=${encodeURIComponent(tier.name)}`}
                            className={`
              w-full py-4 rounded-full uppercase text-[12px] tracking-[0.1em] font-medium transition-all duration-300 text-center block
              ${tier.isPopular
                                    ? "bg-accent-gold text-background hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                    : "bg-surface border border-white/[0.08] text-white hover:bg-white/[0.05] hover:border-accent-gold/50"}
            `}
                            style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
                        >
                            {tier.buttonText}
                        </a>
                    </div>
                ))}
            </div>

        </section>
    );
}
