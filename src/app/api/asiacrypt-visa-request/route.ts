import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as z from "zod";

const formSchema = z.object({
  title: z.string(),
  otherTitle: z.string().optional(),
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  email: z.string(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  institute: z.string().optional(),
  paperTitle: z.string().optional(),
  academicProfile: z.string().optional(),
  conferenceInterests: z.string().optional(),
  iacrExperience: z.string().optional(),
  fileKey: z.string().optional(),
  fileName: z.string().optional(),
});

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
        other_title: data.otherTitle || null,
        first_name: data.firstName,
        middle_name: data.middleName || null,
        last_name: data.lastName,
        email: data.email,
        date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        nationality: data.nationality,
        institute: data.institute,
        paper_title: data.paperTitle || null,
        academic_profile: data.academicProfile || null,
        conference_interests: data.conferenceInterests,
        iacr_experience: data.iacrExperience,
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
