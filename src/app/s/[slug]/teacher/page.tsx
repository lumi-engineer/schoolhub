import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TeacherDashboard from "./TeacherDashboard";

export default async function TeacherPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();

  if (!session || session.schoolSlug !== slug) {
    redirect(`/s/${slug}/login`);
  }
  if (session.role !== "TEACHER") {
    redirect(`/s/${slug}/${session.role.toLowerCase()}`);
  }

  const school = await prisma.school.findUnique({ where: { slug } });
  if (!school) notFound();

  return (
    <TeacherDashboard slug={slug} schoolName={school.name} userName={session.name} />
  );
}
