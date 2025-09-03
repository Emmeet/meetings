import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    let where: any = {};
    if (type) {
      where.type = parseInt(type, 10);
    }

    const data = await prisma.asiacrypt_visa_request.findMany({ where });
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
