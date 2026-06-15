import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const channels = await prisma.channel.findMany({
    where: {
      schoolId: session.schoolId,
      members: { some: { userId: session.userId } },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, role: true } } },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const directChannels = channels.filter((c) => c.type === "DIRECT");
  const groupChannels = channels.filter((c) => c.type !== "DIRECT");

  return NextResponse.json({ direct: directChannels, group: groupChannels });
}
