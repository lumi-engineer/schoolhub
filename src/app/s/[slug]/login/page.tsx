import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const school = await prisma.school.findUnique({ where: { slug } });
  if (!school) notFound();

  return <LoginForm slug={slug} schoolName={school.name} />;
}
