import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with a placeholder key.
// In production, ensure STRIPE_SECRET_KEY is set in .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-01-28.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const error = err as Error;
      console.error(`Webhook signature verification failed: ${error.message}`);
      return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
    }

    const { prisma } = await import("@/lib/prisma");

    // Handle the subscription lifecycle events
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === "paid") {
          try {
            const order = await prisma.order.findUnique({ where: { paymentIntentId: session.id } });
            if (order) {
              await prisma.order.update({
                where: { paymentIntentId: session.id },
                data: { status: "PAID" }
              });
              console.log(`✅ Order ${session.id} marked as PAID.`);
            } else {
              const booking = await prisma.booking.findUnique({ where: { paymentIntentId: session.id } });
              if (booking) {
                await prisma.booking.update({
                  where: { paymentIntentId: session.id },
                  data: { status: "CONFIRMED", paymentStatus: "PAID" }
                });
                console.log(`✅ Booking ${session.id} marked as CONFIRMED.`);
              }
            }
          } catch (e) {
            console.error("Fulfillment error:", e);
          }
        }
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription;
        const subId = subscription.id;
        const status = subscription.status; // trialing, active, past_due, canceled

        // Check if it belongs to a GymBranch (SaaS)
        try {
          const gym = await prisma.gymBranch.findUnique({ where: { stripeSubscriptionId: subId } });
          if (gym) {
            await prisma.gymBranch.update({
              where: { id: gym.id },
              data: { saasStatus: status }
            });
            console.log(`✅ GymBranch ${gym.id} SaaS status updated to ${status}`);
          }
        } catch (e) {
          // Ignore if not found
        }

        // Check if it belongs to a Member
        try {
          const userSub = await prisma.subscription.findUnique({ where: { stripeSubscriptionId: subId } });
          if (userSub) {
            await prisma.subscription.update({
              where: { id: userSub.id },
              data: {
                status: status,
                currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
              }
            });
            await prisma.user.update({
              where: { id: userSub.userId },
              data: { subscriptionStatus: status }
            });
            console.log(`✅ Member Subscription ${userSub.id} status updated to ${status}`);
          }
        } catch (e) {
          // Ignore if not found
        }
        break;

      case "invoice.payment_succeeded":
        const invoiceSucceeded = event.data.object as Stripe.Invoice;
        console.log(`Invoice event: payment succeeded for customer ${invoiceSucceeded.customer}`);
        break;

      case "invoice.payment_failed":
        const invoiceFailed = event.data.object as Stripe.Invoice;
        console.log(`Invoice event: payment failed for customer ${invoiceFailed.customer}`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Stripe Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
