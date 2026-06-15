import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";
import { addUserToSchoolChannels } from "@/lib/school";
import { Role } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  username: z.string().min(2),
  password: z.string().min(6),
  role: z.enum(["TEACHER", "STUDENT", "STAFF"]),
  classId: z.string().optional(),
  classIds: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PRINCIPAL") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({
      where: {
        schoolId_username: {
          schoolId: session.schoolId,
          username: data.username,
        },
      },
    });
    if (existing) {
      return NextResponse.json({ error: "Username already exists." }, { status: 400 });
    }

    const hashed = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        password: hashed,
        role: data.role as Role,
        schoolId: session.schoolId,
        classId: data.role === "STUDENT" ? data.classId : undefined,
        teacherClasses:
          data.role === "TEACHER" && data.classIds
            ? {
                create: data.classIds.map((classId) => ({ classId })),
              }
            : undefined,
      },
    });

    await addUserToSchoolChannels(user.id, session.schoolId, user.role);

    return NextResponse.json({
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create user." }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PRINCIPAL") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { schoolId: session.schoolId },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      class: { select: { id: true, name: true } },
      teacherClasses: {
        select: { class: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
