import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      nationality,
      institute,
      acceptedPaper,
      birthDate,
      email,
      id,
    } = body;
    if (
      !fullName ||
      !nationality ||
      !institute ||
      !acceptedPaper ||
      !birthDate ||
      !email ||
      !id
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 调用外部邮件服务
    const emailRes = await fetch(
      "https://email-service.anseninnov.au/send-participant/letter",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          nationality,
          institute,
          acceptedPaper,
          birthDate,
          email,
        }),
      }
    );
    if (!emailRes.ok) {
      return NextResponse.json(
        { success: false, error: "Email service failed" },
        { status: 500 }
      );
    }

    // 更新数据库 send 字段
    await prisma.asiacrypt_visa_request.update({
      where: { id },
      data: { send: 1 },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
