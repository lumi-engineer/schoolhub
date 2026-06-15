import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StaffDashboard from "./StaffDashboard";

export default async function StaffPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();

  if (!session || session.schoolSlug !== slug) {
    redirect(`/s/${slug}/login`);
  }
  if (session.role !== "STAFF") {
    redirect(`/s/${slug}/${session.role.toLowerCase()}`);
  }

  const school = await prisma.school.findUnique({ where: { slug } });
  if (!school) notFound();

  return (
    <StaffDashboard slug={slug} schoolName={school.name} userName={session.name} />
  );
}
