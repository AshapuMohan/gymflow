import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';

export async function POST(request: Request) {
    try {
        const { amount, currency = "INR", receipt } = await request.json();

        const options = {
            amount: Math.round(amount * 100), // amount in the smallest currency unit
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);
        return NextResponse.json(order);
    } catch (error) {
        console.error('Razorpay Error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
