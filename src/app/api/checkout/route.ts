import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { items } = body; // Array of { productId, quantity }

        if (!items || items.length === 0) {
            return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Fetch products from DB to verify prices server-side
        const productIds = items.map((i: { productId: string }) => i.productId);
        const productsDB = await prisma.product.findMany({
            where: { id: { in: productIds }, isActive: true }
        });

        if (productsDB.length !== productIds.length) {
            return NextResponse.json({ message: 'One or more products are unavailable' }, { status: 400 });
        }

        let totalAmount = 0;
        items.forEach((item: { productId: string; quantity: number }) => {
            const product = productsDB.find(p => p.id === item.productId);
            if (product) totalAmount += product.price * item.quantity;
        });

        const stripeKey = process.env.STRIPE_SECRET_KEY;
        const hasRealStripe = stripeKey && stripeKey !== 'sk_test_placeholder' && stripeKey.length > 20;

        if (hasRealStripe) {
            // --- LIVE STRIPE CHECKOUT ---
            const Stripe = (await import('stripe')).default;
            const stripe = new Stripe(stripeKey!, { apiVersion: '2026-01-28.clover' as any });

            const lineItems = items.map((item: { productId: string; quantity: number }) => {
                const product = productsDB.find(p => p.id === item.productId)!;
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: { name: product.name },
                        unit_amount: Math.round(product.price * 100),
                    },
                    quantity: item.quantity,
                };
            });

            const stripeSession = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                customer_email: user.email!,
                line_items: lineItems,
                mode: 'payment',
                success_url: `${process.env.NEXTAUTH_URL}/dashboard/orders?success=true`,
                cancel_url: `${process.env.NEXTAUTH_URL}/store?canceled=true`,
            });

            await prisma.order.create({
                data: {
                    userId: user.id,
                    totalAmount,
                    status: 'PENDING',
                    paymentIntentId: stripeSession.id,
                    items: {
                        create: items.map((item: { productId: string; quantity: number }) => {
                            const product = productsDB.find(p => p.id === item.productId)!;
                            return { productId: item.productId, quantity: item.quantity, priceAt: product.price };
                        })
                    }
                }
            });

            return NextResponse.json({ url: stripeSession.url }, { status: 200 });

        } else {
            // --- MOCK CHECKOUT (no Stripe key configured) ---
            // Creates a confirmed order directly in DB and redirects to orders page
            const order = await prisma.order.create({
                data: {
                    userId: user.id,
                    totalAmount,
                    status: 'COMPLETED',
                    paymentIntentId: `mock_${Date.now()}`,
                    items: {
                        create: items.map((item: { productId: string; quantity: number }) => {
                            const product = productsDB.find(p => p.id === item.productId)!;
                            return { productId: item.productId, quantity: item.quantity, priceAt: product.price };
                        })
                    }
                }
            });

            const successUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/orders?success=true&orderId=${order.id}`;
            return NextResponse.json({ url: successUrl, mock: true }, { status: 200 });
        }

    } catch (error) {
        console.error('Checkout Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
