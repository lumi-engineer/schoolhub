"use client";

import { useEffect, useState } from "react";
import { DashboardLayout, Card, Button, Badge } from "@/components/ui";
import { ChatPanel } from "@/components/ChatPanel";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  status: string;
  createdBy: { name: string };
}

export default function StudentDashboard({
  slug,
  schoolName,
  userName,
  className,
}: {
  slug: string;
  schoolName: string;
  userName: string;
  className?: string;
}) {
  const [tab, setTab] = useState<"tasks" | "chat">("tasks");
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  async function loadTasks() {
    const res = await fetch("/api/tasks");
    if (res.ok) setTasks(await res.json());
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function toggleTask(id: string, current: string) {
    const status = current === "COMPLETED" ? "PENDING" : "COMPLETED";
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadTasks();
  }

  return (
    <DashboardLayout slug={slug} schoolName={schoolName} userName={userName} role="STUDENT">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Student Dashboard</h1>
        <p className="text-slate-500">
          View your tasks and message your teachers.
          {className && <span className="text-indigo-600"> · {className}</span>}
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        <Button variant={tab === "tasks" ? "primary" : "secondary"} onClick={() => setTab("tasks")}>
          My Tasks
        </Button>
        <Button variant={tab === "chat" ? "primary" : "secondary"} onClick={() => setTab("chat")}>
          Chat
        </Button>
      </div>

      {tab === "tasks" && (
        <Card title="Assigned tasks">
          <div className="space-y-3">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="flex items-start justify-between gap-4 rounded-lg bg-slate-50 px-4 py-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t.title}</span>
                    <Badge color={t.status === "COMPLETED" ? "green" : "amber"}>
                      {t.status}
                    </Badge>
                  </div>
                  {t.description && (
                    <p className="mt-1 text-sm text-slate-600">{t.description}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    From {t.createdBy.name}
                    {t.dueDate && ` · Due ${new Date(t.dueDate).toLocaleDateString()}`}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => toggleTask(t.id, t.status)}
                >
                  {t.status === "COMPLETED" ? "Mark pending" : "Mark done"}
                </Button>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-sm text-slate-400">No tasks assigned yet. Check back later!</p>
            )}
          </div>
        </Card>
      )}

      {tab === "chat" && <ChatPanel />}
    </DashboardLayout>
  );
}
