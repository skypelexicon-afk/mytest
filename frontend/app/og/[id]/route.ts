import sharp from "sharp";
import { NextResponse, NextRequest } from "next/server";

interface RouteContext {
    params: { id: string };
}

export async function GET(req: NextRequest) {
    // Extract the dynamic route param "id" from the pathname
    const pathnameParts = req.nextUrl.pathname.split("/");
    // pathname: /api/og/2 -> ["", "api", "og", "2"]
    const id = pathnameParts[pathnameParts.length - 1];

    // Get query param "type"
    const type = req.nextUrl.searchParams.get("type") || "course";

    // Choose API endpoint based on type
    const apiUrl =
        type === "bundle"
            ? `https://tendingtoinfinityacademy.com/api/bundle/${id}`
            : `https://tendingtoinfinityacademy.com/api/courses/unauth/${id}`;

    // Fetch course data
    const res = await fetch(apiUrl, { cache: "no-store" });
    if (!res.ok) {
        return new NextResponse("Course not found", { status: 404 });
    }
    const courseData = await res.json();

    // Get course image URL (fallback to default if missing)
    const imageUrl =
        type === "bundle"
            ? courseData.bundle.hero_image
            : courseData.course.image;

    // Fetch the actual image
    const imgRes = await fetch(imageUrl);
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

    // Compress and resize
    const compressedBuffer = await sharp(imgBuffer)
        .resize(1200, 630, { fit: "cover" })
        .jpeg({ quality: 80 })
        .toBuffer();

    const compressedUint8 = new Uint8Array(compressedBuffer);

    return new NextResponse(compressedUint8, {
        headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=86400",
        },
    });
}
