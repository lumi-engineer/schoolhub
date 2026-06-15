import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ content: z.string().min(1).max(2000) });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: channelId } = await params;

  const membership = await prisma.channelMember.findUnique({
    where: { channelId_userId: { channelId, userId: session.userId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Not a member of this channel." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { content } = schema.parse(body);

    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.userId,
        channelId,
      },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });

    return NextResponse.json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: channelId } = await params;

  const membership = await prisma.channelMember.findUnique({
    where: { channelId_userId: { channelId, userId: session.userId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Not a member of this channel." }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { channelId },
    include: { sender: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return NextResponse.json(messages);
}
