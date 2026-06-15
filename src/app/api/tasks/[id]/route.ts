import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const task = await prisma.task.findUnique({ where: { id } });

  if (!task || task.schoolId !== session.schoolId) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  if (session.role === "STUDENT" && task.assignedToId !== session.userId) {
    const student = await prisma.user.findUnique({
      where: { id: session.userId },
    });
    if (task.classId !== student?.classId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }
  }

  const body = await request.json();
  const status = body.status === "COMPLETED" ? "COMPLETED" : "PENDING";

  const updated = await prisma.task.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(updated);
}
