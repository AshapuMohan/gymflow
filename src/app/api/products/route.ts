import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Fetch all active products
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        const products = await prisma.product.findMany({
            where: {
                isActive: true,
                ...(category && category !== 'All' ? { category } : {}),
                ...(search ? { name: { contains: search } } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error('Products GET error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST - Add a new product (GYMADMIN or SUPERADMIN only)
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || !['GYMADMIN', 'SUPERADMIN'].includes(session.user.role || '')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { name, category, sku, description, price, inventory, imageUrl } = body;

        if (!name || !category || !sku || !price) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Check SKU uniqueness
        const existing = await prisma.product.findUnique({ where: { sku } });
        if (existing) {
            return NextResponse.json({ message: 'SKU already exists' }, { status: 409 });
        }

        const product = await prisma.product.create({
            data: {
                name,
                category,
                sku,
                description,
                price: parseFloat(price),
                inventory: parseInt(inventory) || 0,
                imageUrl,
                isActive: true,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Products POST error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
