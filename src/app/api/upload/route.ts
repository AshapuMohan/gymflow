import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !["GYMADMIN", "SUPERADMIN"].includes(session.user.role || "")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ message: "No file provided" }, { status: 400 });
        }

        // Validate type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ message: "Only image files are allowed" }, { status: 400 });
        }

        // Max 5 MB
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ message: "File too large (max 5MB)" }, { status: 400 });
        }

        const uploadDir = path.join(process.cwd(), "public", "products");
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const ext = file.name.split(".").pop();
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(path.join(uploadDir, filename), buffer);

        const url = `/products/${filename}`;
        return NextResponse.json({ url }, { status: 201 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ message: "Upload failed" }, { status: 500 });
    }
}
