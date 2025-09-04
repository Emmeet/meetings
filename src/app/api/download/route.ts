import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 配置
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_END_POINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileKey = searchParams.get("fileKey");

    if (!fileKey) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 }
      );
    }

    // 从R2获取文件
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: fileKey,
    });

    const response = await s3.send(command);

    if (!response.Body) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // 将流转换为Buffer
    const chunks = [];
    const reader = response.Body.transformToWebStream().getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const buffer = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));

    // 从fileKey中提取原始文件名
    const fileName = fileKey.split("_").slice(1).join("_") || "document.pdf";

    // 返回文件流
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": response.ContentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}