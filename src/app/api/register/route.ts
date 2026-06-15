import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify, registerSchool } from "@/lib/school";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(40).optional(),
  principalName: z.string().min(2).max(100),
  principalUsername: z.string().min(2).max(50),
  principalPassword: z.string().min(6).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    const slug = data.slug || slugify(data.name);

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Subdomain can only contain lowercase letters, numbers, and hyphens." },
        { status: 400 }
      );
    }

    const school = await registerSchool({
      name: data.name,
      slug,
      principalName: data.principalName,
      principalUsername: data.principalUsername,
      principalPassword: data.principalPassword,
    });

    return NextResponse.json({
      slug: school.slug,
      name: school.name,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
