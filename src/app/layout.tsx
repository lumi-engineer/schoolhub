import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SchoolHub — School Management Platform",
  description: "Multi-tenant school platform with tasks, classes, and chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
