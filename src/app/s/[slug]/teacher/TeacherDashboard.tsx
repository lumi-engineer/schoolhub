"use client";

import { useEffect, useState } from "react";
import { DashboardLayout, Card, Button, Input, Select, Badge } from "@/components/ui";
import { ChatPanel } from "@/components/ChatPanel";

interface ClassItem {
  id: string;
  name: string;
  students: { id: string; name: string }[];
  _count: { students: number };
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  status: string;
  class?: { name: string } | null;
  assignedTo?: { name: string } | null;
}

export default function TeacherDashboard({
  slug,
  schoolName,
  userName,
}: {
  slug: string;
  schoolName: string;
  userName: string;
}) {
  const [tab, setTab] = useState<"classes" | "tasks" | "chat">("classes");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    classId: "",
    assignedToId: "",
  });
  const [message, setMessage] = useState("");

  async function loadClasses() {
    const res = await fetch("/api/classes");
    if (res.ok) setClasses(await res.json());
  }

  async function loadTasks(classId?: string) {
    const url = classId ? `/api/tasks?classId=${classId}` : "/api/tasks";
    const res = await fetch(url);
    if (res.ok) setTasks(await res.json());
  }

  useEffect(() => {
    loadClasses();
    loadTasks();
  }, []);

  async function createTask() {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskForm.title,
        description: taskForm.description,
        dueDate: taskForm.dueDate || undefined,
        classId: taskForm.classId || undefined,
        assignedToId: taskForm.assignedToId || undefined,
      }),
    });
    if (res.ok) {
      setMessage("Task assigned successfully.");
      setTaskForm({ title: "", description: "", dueDate: "", classId: "", assignedToId: "" });
      loadTasks(selectedClass);
    }
  }

  const activeClass = classes.find((c) => c.id === selectedClass);
  const students = activeClass?.students || [];

  return (
    <DashboardLayout slug={slug} schoolName={schoolName} userName={userName} role="TEACHER">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h1>
        <p className="text-slate-500">Manage your classes, assign tasks, and communicate.</p>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>
      )}

      <div className="mb-6 flex gap-2">
        {(["classes", "tasks", "chat"] as const).map((t) => (
          <Button
            key={t}
            variant={tab === t ? "primary" : "secondary"}
            onClick={() => setTab(t)}
          >
            {t === "classes" ? "My Classes" : t === "tasks" ? "Tasks" : "Chat"}
          </Button>
        ))}
      </div>

      {tab === "classes" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <Card key={c.id}>
              <h3 className="text-lg font-semibold">{c.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{c._count.students} students</p>
              <Button
                className="mt-4"
                variant="secondary"
                onClick={() => {
                  setSelectedClass(c.id);
                  setTab("tasks");
                  loadTasks(c.id);
                }}
              >
                View & assign tasks
              </Button>
            </Card>
          ))}
          {classes.length === 0 && (
            <p className="text-slate-500">No classes assigned yet. Ask your principal to assign you classes.</p>
          )}
        </div>
      )}

      {tab === "tasks" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Assign a task">
            <div className="space-y-4">
              <Input
                label="Task title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Complete chapter 5 exercises"
              />
              <Input
                label="Description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Details and instructions..."
              />
              <Input
                label="Due date"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              />
              <Select
                label="Class"
                value={taskForm.classId}
                onChange={(e) => {
                  setTaskForm({ ...taskForm, classId: e.target.value, assignedToId: "" });
                  setSelectedClass(e.target.value);
                }}
              >
                <option value="">All / no specific class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
              {taskForm.classId && (
                <Select
                  label="Assign to specific student (optional)"
                  value={taskForm.assignedToId}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })}
                >
                  <option value="">Entire class</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              )}
              <Button onClick={createTask}>Assign task</Button>
            </div>
          </Card>

          <Card title="Tasks">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tasks.map((t) => (
                <div key={t.id} className="rounded-lg bg-slate-50 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t.title}</span>
                    <Badge color={t.status === "COMPLETED" ? "green" : "amber"}>
                      {t.status}
                    </Badge>
                  </div>
                  {t.description && <p className="text-sm text-slate-600">{t.description}</p>}
                  <p className="text-xs text-slate-400">
                    {t.class?.name && `${t.class.name} · `}
                    {t.assignedTo?.name || "Whole class"}
                    {t.dueDate && ` · Due ${new Date(t.dueDate).toLocaleDateString()}`}
                  </p>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-sm text-slate-400">No tasks yet.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {tab === "chat" && <ChatPanel canMessageStudents />}
    </DashboardLayout>
  );
}
