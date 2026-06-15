"use client";

import { useState } from "react";
import { DashboardLayout, Button } from "@/components/ui";
import { ChatPanel } from "@/components/ChatPanel";

export default function StaffDashboard({
  slug,
  schoolName,
  userName,
}: {
  slug: string;
  schoolName: string;
  userName: string;
}) {
  return (
    <DashboardLayout slug={slug} schoolName={schoolName} userName={userName} role="STAFF">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Staff Dashboard</h1>
        <p className="text-slate-500">
          Connect with principals, teachers, and other staff members.
        </p>
      </div>

      <ChatPanel />
    </DashboardLayout>
  );
}
