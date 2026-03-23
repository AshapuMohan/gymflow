"use client";

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Package } from 'lucide-react';
import { MathUtils, Group } from 'three';

interface ProductCardProps {
    name: string;
    price: number;
    category: string;
}

// Mini 3D dumbbell that auto-rotates - no drei needed
function MiniDumbbell() {
    const groupRef = useRef<Group>(null);
    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.6;
        }
    });
    return (
        <group ref={groupRef} scale={0.6}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.2, 0.2, 2, 16]} />
                <meshStandardMaterial color="#1C1C1E" metalness={0.9} roughness={0.1} />
            </mesh>
            {[-1.2, 1.2].map((x) => (
                <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.8, 0.8, 0.4, 32]} />
                    <meshStandardMaterial color="#0A0A0A" metalness={0.8} roughness={0.2} />
                </mesh>
            ))}
            {[-0.95, 0.95].map((x) => (
                <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.81, 0.81, 0.05, 32]} />
                    <meshStandardMaterial color="#B29762" metalness={1} roughness={0.1} />
                </mesh>
            ))}
        </group>
    );
}

export default function ProductCard({ name, price, category }: ProductCardProps) {
    return (
        <div className="glass rounded-[2rem] overflow-hidden group border-white/5 hover:border-accent-gold/30 transition-all duration-500">
            {/* 3D Preview Area */}
            <div className="h-64 relative bg-neutral-900/50 cursor-grab active:cursor-grabbing">
                <Canvas shadows camera={{ position: [0, 0, 4], fov: 40 }}>
                    <ambientLight intensity={0.4} />
                    <directionalLight position={[5, 5, 5]} intensity={1.5} />
                    <directionalLight position={[-3, 2, 2]} intensity={0.6} color="#B29762" />
                    <MiniDumbbell />
                </Canvas>

                <div className="absolute top-6 left-6 px-3 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest text-white/50">
                    {category}
                </div>
            </div>

            {/* Product Info */}
            <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold uppercase italic tracking-tight">{name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-bold text-white">4.9</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-white italic">${price}</span>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 bg-accent-gold text-background rounded-2xl flex items-center justify-center hover:bg-white transition-colors"
                    >
                        <ShoppingCart size={20} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
