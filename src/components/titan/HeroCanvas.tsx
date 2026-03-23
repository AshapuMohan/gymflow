"use client";

import { Canvas } from "@react-three/fiber";
import DumbbellScene from "./DumbbellScene";

interface HeroCanvasProps {
    scrollProgress: number;
}

export default function HeroCanvas({ scrollProgress }: HeroCanvasProps) {
    return (
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
            <DumbbellScene scrollProgress={scrollProgress} />
        </Canvas>
    );
}
