"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointLight, Group, MathUtils, PMREMGenerator } from "three";
// RoomEnvironment is bundled in three — no drei needed
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

interface DumbbellSceneProps {
    scrollProgress: number;
}

export default function DumbbellScene({ scrollProgress }: DumbbellSceneProps) {
    const dumbbellRef = useRef<Group>(null);
    const pointLightRef = useRef<PointLight>(null);
    const floatRef = useRef<Group>(null);
    const { mouse, gl, scene } = useThree();
    const clock = useRef(0);

    // Set up environment map for realistic metal reflections
    useEffect(() => {
        const pmremGenerator = new PMREMGenerator(gl);
        pmremGenerator.compileEquirectangularShader();
        const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTexture;
        pmremGenerator.dispose();
    }, [gl, scene]);

    useFrame((state, delta) => {
        clock.current += delta;

        // Float animation
        if (floatRef.current) {
            floatRef.current.position.y = Math.sin(clock.current * 1.5) * 0.18;
            floatRef.current.rotation.z = Math.sin(clock.current * 0.8) * 0.04;
        }

        // Mouse-follow parallax on dynmaic point light
        if (pointLightRef.current) {
            const targetX = (mouse.x * state.viewport.width) / 2;
            const targetY = (mouse.y * state.viewport.height) / 2;
            pointLightRef.current.position.x = MathUtils.lerp(pointLightRef.current.position.x, targetX * 1.5, 0.1);
            pointLightRef.current.position.y = MathUtils.lerp(pointLightRef.current.position.y, targetY * 1.5 + 2, 0.1);
        }

        // Scroll-based animations
        if (dumbbellRef.current) {
            const rotationProgress = Math.max(0, Math.min(1, (scrollProgress - 0.2) / 0.3));
            const targetRotation = rotationProgress * Math.PI * 2;
            dumbbellRef.current.rotation.y = MathUtils.lerp(dumbbellRef.current.rotation.y, targetRotation, 0.1);

            const scaleDown = scrollProgress > 0.5 ? Math.max(0, 1 - (scrollProgress - 0.5) * 2) : 1;
            dumbbellRef.current.scale.setScalar(MathUtils.lerp(dumbbellRef.current.scale.x, scaleDown, 0.1));
        }

        // Camera zoom on scroll (0–20%)
        const zoomProgress = Math.min(1, scrollProgress / 0.2);
        state.camera.position.z = MathUtils.lerp(state.camera.position.z, 8 - zoomProgress * 3, 0.1);
    });

    return (
        <>
            <color attach="background" args={["#0A0A0A"]} />

            {/* Ambient base + key lights */}
            <ambientLight intensity={0.15} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
            {/* Gold-tinted fill light from the left */}
            <directionalLight position={[-5, 2, 2]} intensity={0.6} color="#C9A96E" />
            {/* Soft back light */}
            <directionalLight position={[0, -3, -5]} intensity={0.3} color="#334155" />

            {/* Dynamic mouse-follow PointLight */}
            <pointLight
                ref={pointLightRef}
                position={[0, 2, 5]}
                intensity={8}
                color="#ffffff"
                distance={20}
                decay={2}
            />

            {/* Float wrapper */}
            <group ref={floatRef}>
                <group ref={dumbbellRef}>
                    {/* Handle — dark titanium */}
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.22, 0.22, 2.2, 64]} />
                        <meshStandardMaterial
                            color="#2A2A2E"
                            metalness={0.95}
                            roughness={0.08}
                            envMapIntensity={2.5}
                        />
                    </mesh>

                    {/* Handle knurling rings */}
                    {[-0.6, -0.2, 0.2, 0.6].map((x) => (
                        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.24, 0.24, 0.06, 32]} />
                            <meshStandardMaterial color="#3A3A40" metalness={0.9} roughness={0.15} envMapIntensity={2} />
                        </mesh>
                    ))}

                    {/* Left Weight disc */}
                    <mesh position={[-1.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.9, 0.9, 0.5, 64]} />
                        <meshStandardMaterial
                            color="#141418"
                            metalness={0.85}
                            roughness={0.15}
                            envMapIntensity={2}
                        />
                    </mesh>

                    {/* Right Weight disc */}
                    <mesh position={[1.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.9, 0.9, 0.5, 64]} />
                        <meshStandardMaterial
                            color="#141418"
                            metalness={0.85}
                            roughness={0.15}
                            envMapIntensity={2}
                        />
                    </mesh>

                    {/* Gold collar rings — left */}
                    <mesh position={[-1.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.92, 0.92, 0.08, 64]} />
                        <meshStandardMaterial color="#B8943F" metalness={1.0} roughness={0.05} envMapIntensity={3} />
                    </mesh>
                    <mesh position={[-0.78, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.92, 0.92, 0.04, 64]} />
                        <meshStandardMaterial color="#D4AF55" metalness={1.0} roughness={0.04} envMapIntensity={3} />
                    </mesh>

                    {/* Gold collar rings — right */}
                    <mesh position={[1.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.92, 0.92, 0.08, 64]} />
                        <meshStandardMaterial color="#B8943F" metalness={1.0} roughness={0.05} envMapIntensity={3} />
                    </mesh>
                    <mesh position={[0.78, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.92, 0.92, 0.04, 64]} />
                        <meshStandardMaterial color="#D4AF55" metalness={1.0} roughness={0.04} envMapIntensity={3} />
                    </mesh>
                </group>
            </group>
        </>
    );
}
