import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('admin123', 10);

    // Create a Gym Branch first for the GYMADMIN
    const branch = await prisma.gymBranch.upsert({
        where: { id: 'branch-1' },
        update: {},
        create: {
            id: 'branch-1',
            name: 'Titan X - Downtown HQ',
            location: 'New York, NY',
            contactInfo: 'hq@titanx.com'
        },
    });

    // Seed SUPERADMIN
    await prisma.user.upsert({
        where: { email: 'superadmin@titan.com' },
        update: {},
        create: {
            name: 'Global Director',
            email: 'superadmin@titan.com',
            password,
            role: 'SUPERADMIN',
        },
    });

    // Seed GYMADMIN
    await prisma.user.upsert({
        where: { email: 'gymowner@titan.com' },
        update: {},
        create: {
            name: 'Branch Manager',
            email: 'gymowner@titan.com',
            password,
            role: 'GYMADMIN',
            gymBranchId: branch.id,
        },
    });

    // Seed MEMBER
    await prisma.user.upsert({
        where: { email: 'athlete@titan.com' },
        update: {},
        create: {
            name: 'Elite Athlete',
            email: 'athlete@titan.com',
            password,
            role: 'MEMBER',
        },
    });

    console.log("Database seeded successfully with default roles.");
    console.log("-------------------------------------------------");
    console.log("SUPERADMIN: superadmin@titan.com | pw: admin123");
    console.log("GYMADMIN:   gymowner@titan.com   | pw: admin123");
    console.log("MEMBER:     athlete@titan.com    | pw: admin123");
    console.log("-------------------------------------------------");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
