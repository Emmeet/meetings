import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      otherTitle,
      first_name,
      middle_name,
      last_name,
      email,
      phone,
      affiliation,
      position,
      type,
      paper_number,
      have_visa,
      dietary_requirements,
      other_explain,
    } = body;

    const newCustomer = await prisma.customer_info.create({
      data: {
        title,
        other_title: otherTitle,
        first_name,
        middle_name,
        last_name,
        email,
        phone,
        affiliation,
        position,
        type,
        paper_number,
        have_visa,
        dietary_requirements,
        other_explain,
        create_date: new Date().toISOString(),
      },
    });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Error creating customer" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * pageSize;

    // 构建搜索条件
    const where = search
      ? {
          OR: [
            { first_name: { contains: search } },
            { last_name: { contains: search } },
            { email: { contains: search } },
            { affiliation: { contains: search } },
            { position: { contains: search } },
          ],
        }
      : {};

    // 获取总数
    const total = await prisma.customer_info.count({ where });

    // 获取数据
    const customers = await prisma.customer_info.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return NextResponse.json({
      data: customers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Error fetching customers" },
      { status: 500 }
    );
  }
}
