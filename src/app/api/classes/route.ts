import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ name: z.string().min(2).max(50) });

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PRINCIPAL") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name } = schema.parse(body);

    const existing = await prisma.class.findUnique({
      where: { schoolId_name: { schoolId: session.schoolId, name } },
    });
    if (existing) {
      return NextResponse.json({ error: "Class already exists." }, { status: 400 });
    }

    const cls = await prisma.class.create({
      data: { name, schoolId: session.schoolId },
    });

    return NextResponse.json(cls);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create class." }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const where =
    session.role === "TEACHER"
      ? {
          schoolId: session.schoolId,
          teacherClasses: { some: { teacherId: session.userId } },
        }
      : { schoolId: session.schoolId };

  const classes = await prisma.class.findMany({
    where,
    include: {
      students: { select: { id: true, name: true } },
      teacherClasses: {
        include: { teacher: { select: { id: true, name: true } } },
      },
      _count: { select: { students: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(classes);
}
