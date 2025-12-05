import { NextRequest, NextResponse } from "next/server";

/**
 * Simple image upload endpoint for hackathon
 * In production, use IPFS (Pinata, Web3.Storage) or cloud storage (S3, Cloudinary)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // For hackathon: convert to base64 and return
    // In production, upload to IPFS or cloud storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // In production, you would:
    // 1. Upload to IPFS: const ipfsHash = await uploadToIPFS(buffer);
    // 2. Return IPFS URL: return NextResponse.json({ url: `https://ipfs.io/ipfs/${ipfsHash}` });

    return NextResponse.json({
      url: dataUrl,
      // For production: url: `https://ipfs.io/ipfs/${ipfsHash}`
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

