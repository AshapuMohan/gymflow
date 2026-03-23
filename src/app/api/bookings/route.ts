import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { classId } = body;

        const scheduledClass = await prisma.class.findUnique({
            where: { id: classId },
            include: { bookings: true }
        });

        if (!scheduledClass) return NextResponse.json({ message: 'Class not found' }, { status: 404 });

        // Check capacity
        const enrolled = scheduledClass.bookings.filter(b => b.status === "CONFIRMED").length;
        if (enrolled >= scheduledClass.maxSeats) {
            return NextResponse.json({ message: 'Class is fully booked' }, { status: 400 });
        }

        // Check if already booked
        const existing = scheduledClass.bookings.find(b => b.userId === session.user.id);
        if (existing && existing.status === 'CONFIRMED') {
            return NextResponse.json({ message: 'Already booked' }, { status: 400 });
        }

        const stripeKey = process.env.STRIPE_SECRET_KEY;
        const hasRealStripe = stripeKey && stripeKey !== 'sk_test_placeholder' && stripeKey.length > 20;

        if (scheduledClass.price === 0) {
            // Free Class
            await prisma.booking.upsert({
                where: { userId_classId: { userId: session.user.id, classId } },
                update: { status: 'CONFIRMED', paymentStatus: 'FREE' },
                create: {
                    userId: session.user.id,
                    classId,
                    status: 'CONFIRMED',
                    paymentStatus: 'FREE'
                }
            });
            return NextResponse.json({ success: true, url: `${process.env.NEXTAUTH_URL}/dashboard/classes?success=true` }, { status: 200 });
        } else {
            // Paid Class
            if (hasRealStripe) {
                const stripe = new Stripe(stripeKey!, { apiVersion: '2026-01-28.clover' as any });
                const stripeSession = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    customer_email: session.user.email!,
                    line_items: [{
                        price_data: {
                            currency: 'usd',
                            product_data: { name: `Booking: ${scheduledClass.name}` },
                            unit_amount: Math.round(scheduledClass.price * 100),
                        },
                        quantity: 1,
                    }],
                    mode: 'payment',
                    success_url: `${process.env.NEXTAUTH_URL}/dashboard/classes?success=true`,
                    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/classes?canceled=true`,
                });

                // Create PENDING booking
                await prisma.booking.upsert({
                    where: { userId_classId: { userId: session.user.id, classId } },
                    update: { paymentIntentId: stripeSession.id, status: 'PENDING', paymentStatus: 'PENDING' },
                    create: {
                        userId: session.user.id,
                        classId,
                        status: 'PENDING',
                        paymentStatus: 'PENDING',
                        paymentIntentId: stripeSession.id
                    }
                });

                return NextResponse.json({ url: stripeSession.url }, { status: 200 });
            } else {
                // Mock Checkout
                await prisma.booking.upsert({
                    where: { userId_classId: { userId: session.user.id, classId } },
                    update: { status: 'CONFIRMED', paymentStatus: 'PAID', paymentIntentId: `mock_booking_${Date.now()}` },
                    create: {
                        userId: session.user.id,
                        classId,
                        status: 'CONFIRMED',
                        paymentStatus: 'PAID',
                        paymentIntentId: `mock_booking_${Date.now()}`
                    }
                });
                return NextResponse.json({ mock: true, url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/classes?success=true` }, { status: 200 });
            }
        }
    } catch (error) {
        console.error('Booking Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
