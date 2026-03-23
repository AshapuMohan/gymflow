import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !["GYMADMIN", "SUPERADMIN"].includes(role)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { id: orderId } = await params;
        const body = await req.json();
        const { status, trackingNumber } = body;

        if (status && !VALID_STATUSES.includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 });
        }

        // Fetch order with owner's user branch to gate GymAdmin to their branch only
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: { select: { gymBranchId: true } } }
        });

        if (!order) {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }

        // GymAdmin can only update orders from their own branch
        if (role === "GYMADMIN" && order.user?.gymBranchId !== session.user?.gymBranchId) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const dataToUpdate: any = {};
        if (status) dataToUpdate.status = status;
        if (trackingNumber !== undefined) dataToUpdate.trackingNumber = trackingNumber;

        const updated = await prisma.order.update({
            where: { id: orderId },
            data: dataToUpdate
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error("Order update error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
