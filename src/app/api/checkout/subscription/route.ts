import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { membershipPlanId, type } = body; // type is 'saas' or 'membership'

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const stripeKey = process.env.STRIPE_SECRET_KEY;
        // Require strictly defined secret key formats for live integration
        const hasRealStripe = stripeKey && stripeKey !== 'sk_test_placeholder' && stripeKey.length > 20;

        // 1) GYM ADMIN SAAS SUBSCRIPTION
        if (type === 'saas' && user.role === 'GYMADMIN') {
            if (!user.gymBranchId) {
                return NextResponse.json({ message: 'No gym branch found for this admin' }, { status: 400 });
            }

            if (hasRealStripe) {
                const stripe = new Stripe(stripeKey!, { apiVersion: '2026-01-28.clover' as any });
                const stripeSession = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    customer_email: user.email!,
                    line_items: [{
                        price_data: {
                            currency: 'usd',
                            product_data: { name: 'Titan X SaaS Platform - Monthly' },
                            unit_amount: 9900, // $99.00/month
                            recurring: { interval: 'month' }
                        },
                        quantity: 1,
                    }],
                    mode: 'subscription',
                    success_url: `${process.env.NEXTAUTH_URL}/dashboard/branch?saas_success=true`,
                    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/branch/billing?canceled=true`,
                });
                return NextResponse.json({ url: stripeSession.url }, { status: 200 });
            } else {
                // Mock SaaS Checkout
                await prisma.gymBranch.update({
                    where: { id: user.gymBranchId },
                    data: {
                        saasStatus: 'active',
                        stripeSubscriptionId: `mock_saas_${Date.now()}`
                    }
                });
                return NextResponse.json({ url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/branch?saas_success=true`, mock: true }, { status: 200 });
            }
        }

        // 2) MEMBER GYM MEMBERSHIP SUBSCRIPTION
        if (type === 'membership' && user.role === 'MEMBER') {
            const plan = await prisma.membershipPlan.findUnique({ where: { id: membershipPlanId } });
            if (!plan) return NextResponse.json({ message: 'Plan not found' }, { status: 404 });

            if (hasRealStripe) {
                const stripe = new Stripe(stripeKey!, { apiVersion: '2026-01-28.clover' as any });
                const stripeSession = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    customer_email: user.email!,
                    line_items: [{
                        price_data: {
                            currency: 'usd',
                            product_data: { name: plan.name },
                            unit_amount: Math.round(plan.price * 100),
                            recurring: { interval: plan.interval as any }
                        },
                        quantity: 1,
                    }],
                    mode: 'subscription',
                    success_url: `${process.env.NEXTAUTH_URL}/dashboard?membership_success=true`,
                    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?canceled=true`,
                });
                return NextResponse.json({ url: stripeSession.url }, { status: 200 });
            } else {
                // Mock Member Subscription
                const mockSubId = `mock_sub_${Date.now()}`;

                const end = new Date();
                if (plan.interval === 'year') end.setFullYear(end.getFullYear() + 1);
                else end.setMonth(end.getMonth() + 1);

                await prisma.subscription.create({
                    data: {
                        userId: user.id,
                        stripeSubscriptionId: mockSubId,
                        plan: plan.name,
                        status: 'active',
                        currentPeriodEnd: end
                    }
                });

                await prisma.user.update({
                    where: { id: user.id },
                    data: { subscriptionStatus: 'active', membershipPlan: plan.name }
                });

                return NextResponse.json({ url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard?membership_success=true`, mock: true }, { status: 200 });
            }
        }

        return NextResponse.json({ message: 'Invalid request parameters' }, { status: 400 });

    } catch (error) {
        console.error('Subscription Checkout Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
