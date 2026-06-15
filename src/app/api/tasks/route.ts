import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  classId: z.string().optional(),
  assignedToId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "TEACHER" && session.role !== "PRINCIPAL")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || "",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        schoolId: session.schoolId,
        classId: data.classId,
        assignedToId: data.assignedToId,
        createdById: session.userId,
      },
      include: {
        class: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create task." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");

  let where: Record<string, unknown> = { schoolId: session.schoolId };

  if (session.role === "STUDENT") {
    const student = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { classId: true },
    });
    where = {
      schoolId: session.schoolId,
      OR: [
        { assignedToId: session.userId },
        { classId: student?.classId },
      ],
    };
  } else if (session.role === "TEACHER") {
    const teacherClasses = await prisma.teacherClass.findMany({
      where: { teacherId: session.userId },
      select: { classId: true },
    });
    const classIds = teacherClasses.map((tc) => tc.classId);
    where = {
      schoolId: session.schoolId,
      OR: [
        { createdById: session.userId },
        { classId: { in: classIds } },
      ],
    };
    if (classId) where = { schoolId: session.schoolId, classId };
  } else if (classId) {
    where = { schoolId: session.schoolId, classId };
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      class: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}
