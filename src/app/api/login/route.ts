import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword, roleDashboardPath } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  slug: z.string().min(2),
  username: z.string().min(2),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, username, password } = schema.parse(body);

    const school = await prisma.school.findUnique({ where: { slug } });
    if (!school) {
      return NextResponse.json({ error: "School not found." }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { schoolId_username: { schoolId: school.id, username } },
    });

    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    await createSession({
      userId: user.id,
      schoolId: school.id,
      schoolSlug: school.slug,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      redirect: roleDashboardPath(school.slug, user.role),
      role: user.role,
      name: user.name,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
