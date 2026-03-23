import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'mock_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret',
});

import crypto from 'crypto';

export const verifyRazorpaySignature = (orderId: string, paymentId: string, signature: string) => {
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
    hmac.update(orderId + "|" + paymentId);
    const generatedSignature = hmac.digest('hex');
    return generatedSignature === signature;
};
