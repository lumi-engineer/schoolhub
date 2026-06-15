import { prisma } from "./prisma";
import { ChannelType, Role } from "@prisma/client";
import { hashPassword } from "./auth";

export function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export async function createSchoolChannels(schoolId: string) {
  const staffChannel = await prisma.channel.create({
    data: {
      type: ChannelType.STAFF,
      name: "Staff Lounge",
      schoolId,
    },
  });

  const teachersChannel = await prisma.channel.create({
    data: {
      type: ChannelType.TEACHERS,
      name: "Teachers Lounge",
      schoolId,
    },
  });

  return { staffChannel, teachersChannel };
}

export async function registerSchool(data: {
  name: string;
  slug: string;
  principalName: string;
  principalUsername: string;
  principalPassword: string;
}) {
  const existing = await prisma.school.findUnique({
    where: { slug: data.slug },
  });
  if (existing) {
    throw new Error("This subdomain is already taken.");
  }

  const hashed = await hashPassword(data.principalPassword);

  const school = await prisma.school.create({
    data: {
      name: data.name,
      slug: data.slug,
      users: {
        create: {
          username: data.principalUsername,
          password: hashed,
          name: data.principalName,
          role: Role.PRINCIPAL,
        },
      },
    },
    include: { users: true },
  });

  const channels = await createSchoolChannels(school.id);
  const principal = school.users[0];

  await prisma.channelMember.createMany({
    data: [
      { channelId: channels.staffChannel.id, userId: principal.id },
      { channelId: channels.teachersChannel.id, userId: principal.id },
    ],
  });

  return school;
}

export async function addUserToSchoolChannels(
  userId: string,
  schoolId: string,
  role: Role
) {
  const channels = await prisma.channel.findMany({
    where: { schoolId },
  });

  const memberships: { channelId: string; userId: string }[] = [];

  for (const channel of channels) {
    if (channel.type === ChannelType.STAFF) {
      if (role === Role.PRINCIPAL || role === Role.TEACHER || role === Role.STAFF) {
        memberships.push({ channelId: channel.id, userId });
      }
    }
    if (channel.type === ChannelType.TEACHERS) {
      if (role === Role.PRINCIPAL || role === Role.TEACHER) {
        memberships.push({ channelId: channel.id, userId });
      }
    }
  }

  if (memberships.length > 0) {
    for (const membership of memberships) {
      await prisma.channelMember.upsert({
        where: {
          channelId_userId: {
            channelId: membership.channelId,
            userId: membership.userId,
          },
        },
        create: membership,
        update: {},
      });
    }
  }
}

export async function getOrCreateDirectChannel(
  schoolId: string,
  userId1: string,
  userId2: string
) {
  const directChannels = await prisma.channel.findMany({
    where: {
      schoolId,
      type: ChannelType.DIRECT,
      members: {
        every: { userId: { in: [userId1, userId2] } },
      },
    },
    include: { members: true },
  });

  const existing = directChannels.find((ch) => ch.members.length === 2);
  if (existing) {
    return existing;
  }

  return prisma.channel.create({
    data: {
      type: ChannelType.DIRECT,
      schoolId,
      members: {
        create: [{ userId: userId1 }, { userId: userId2 }],
      },
    },
  });
}
