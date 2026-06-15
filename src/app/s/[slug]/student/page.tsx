import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StudentDashboard from "./StudentDashboard";

export default async function StudentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();

  if (!session || session.schoolSlug !== slug) {
    redirect(`/s/${slug}/login`);
  }
  if (session.role !== "STUDENT") {
    redirect(`/s/${slug}/${session.role.toLowerCase()}`);
  }

  const school = await prisma.school.findUnique({ where: { slug } });
  if (!school) notFound();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { class: true },
  });

  return (
    <StudentDashboard
      slug={slug}
      schoolName={school.name}
      userName={session.name}
      className={user?.class?.name}
    />
  );
}
