import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getOrCreateDirectChannel } from "@/lib/school";
import { z } from "zod";

const schema = z.object({ userId: z.string() });

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId } = schema.parse(body);

    const otherUser = await prisma.user.findFirst({
      where: { id: userId, schoolId: session.schoolId },
    });
    if (!otherUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const channel = await getOrCreateDirectChannel(
      session.schoolId,
      session.userId,
      userId
    );

    return NextResponse.json(channel);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create channel." }, { status: 500 });
  }
}
