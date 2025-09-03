import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as z from "zod";

const formSchema = z.object({
  title: z.string(),
  type: z.number(),
  otherTitle: z.string().optional(),
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  email: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  institute: z.string().optional(),
  paperNumber: z.string().optional(),
  paperTitle: z.string().optional(),
  academicProfile: z.string().optional(),
  conferenceInterests: z.string().optional(),
  iacrExperience: z.string().optional(),
  fileKey: z.string().optional(),
  fileName: z.string().optional(),
  hasIacr: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const type = searchParams.get("type");

    const skip = (page - 1) * pageSize;

    let where: any = search
      ? {
          OR: [
            { first_name: { contains: search } },
            { last_name: { contains: search } },
            { email: { contains: search } },
            { institute: { contains: search } },
          ],
        }
      : {};

    if (type) {
      where.type = parseInt(type, 10);
    }

    const [data, total] = await Promise.all([
      prisma.asiacrypt_visa_request.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: pageSize,
      }),
      prisma.asiacrypt_visa_request.count({ where }),
    ]);

    return NextResponse.json({
      data,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = formSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const result = await prisma.asiacrypt_visa_request.create({
      data: {
        title: data.title,
        type: data.type,
        other_title: data.otherTitle || null,
        first_name: data.firstName,
        middle_name: data.middleName || null,
        last_name: data.lastName,
        email: data.email || null,
        date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        nationality: data.nationality,
        institute: data.institute,
        paper_number: data.paperNumber || null,
        paper_title: data.paperTitle || null,
        academic_profile: data.academicProfile || null,
        conference_interests: data.conferenceInterests,
        iacr_experience: data.iacrExperience,
        has_iacr: data.hasIacr ? Number(data.hasIacr) : undefined,
        file_key: data.fileKey || null,
        file_name: data.fileName || null,
      },
    });
    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
