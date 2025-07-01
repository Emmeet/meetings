import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, type } = body;

    const paymentLog = await prisma.payment_log.create({
      data: {
        content,
        type,
        create_time: new Date(),
      },
    });

    return NextResponse.json(paymentLog, { status: 201 });
  } catch (error) {
    console.error("Error creating payment log:", error);
    return NextResponse.json(
      { error: "Error creating payment log" },
      { status: 500 }
    );
  }
}
