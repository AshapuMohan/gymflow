import { NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await request.json();

        const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (isValid) {
            // Update order status in DB
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'PAID' }
            });
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, message: 'Invalid Signature' }, { status: 400 });
        }
    } catch (error) {
        console.error('Verification Error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
