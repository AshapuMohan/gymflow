import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    // Crypto/auth — native module or Turbopack ESM incompatible
    'jose', '@panva/hkdf',
    'bcrypt', 'bcryptjs',
    'next-auth', '@next-auth/prisma-adapter',
    // Three.js — broken ESM exports in Turbopack client bundle
    'three', '@react-three/fiber', '@react-three/drei',
  ],
};

export default nextConfig;
