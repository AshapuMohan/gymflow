import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

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
        const { name, price, interval, features } = body;

        if (!name || !price || !interval) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const stripeKey = process.env.STRIPE_SECRET_KEY;
        const hasRealStripe = stripeKey && stripeKey !== 'sk_test_placeholder' && stripeKey.length > 20;

        let stripePriceId = null;

        if (hasRealStripe) {
            const stripe = new Stripe(stripeKey!, { apiVersion: '2026-01-28.clover' as any });

            // Create a product in Stripe first
            const stripeProduct = await stripe.products.create({
                name: `${name} - ${user.gymBranchId}`,
                description: features || ''
            });

            // Create a recurring price
            const stripePrice = await stripe.prices.create({
                currency: 'usd',
                unit_amount: Math.round(parseFloat(price) * 100),
                recurring: { interval: interval },
                product: stripeProduct.id,
            });

            stripePriceId = stripePrice.id;
        }

        const plan = await prisma.membershipPlan.create({
            data: {
                gymBranchId: user.gymBranchId,
                name,
                price: parseFloat(price),
                interval,
                features,
                stripePriceId
            }
        });

        return NextResponse.json(plan, { status: 201 });

    } catch (error) {
        console.error('Plan Creation Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
