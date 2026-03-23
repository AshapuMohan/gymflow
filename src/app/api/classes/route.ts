import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email || session.user.role !== 'GYMADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user?.gymBranchId) {
            return NextResponse.json({ message: 'No branch assigned' }, { status: 400 });
        }

        const body = await req.json();
        const { name, trainer, date, maxSeats, price } = body;

        const newClass = await prisma.class.create({
            data: {
                gymBranchId: user.gymBranchId,
                name,
                trainer,
                date: new Date(date),
                maxSeats: parseInt(maxSeats),
                price: parseFloat(price)
            }
        });

        return NextResponse.json(newClass, { status: 201 });

    } catch (error) {
        console.error('Class Creation Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
