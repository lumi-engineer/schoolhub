"use client";

import { useEffect, useState } from "react";
import { DashboardLayout, Card, Button, Input, Select, Badge } from "@/components/ui";

interface ClassItem {
  id: string;
  name: string;
  _count: { students: number };
}

interface UserItem {
  id: string;
  name: string;
  username: string;
  role: string;
  class?: { name: string } | null;
}

export default function PrincipalDashboard({
  slug,
  schoolName,
  userName,
}: {
  slug: string;
  schoolName: string;
  userName: string;
}) {
  const [tab, setTab] = useState<"users" | "classes">("users");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [newClass, setNewClass] = useState("");
  const [userForm, setUserForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "STUDENT",
    classId: "",
    classIds: [] as string[],
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [clsRes, usersRes] = await Promise.all([
      fetch("/api/classes"),
      fetch("/api/users"),
    ]);
    if (clsRes.ok) setClasses(await clsRes.json());
    if (usersRes.ok) setUsers(await usersRes.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function createClass() {
    setError("");
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newClass }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setNewClass("");
    setMessage(`Class "${data.name}" created.`);
    load();
  }

  async function createUser() {
    setError("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...userForm,
        classIds: userForm.role === "TEACHER" ? userForm.classIds : undefined,
        classId: userForm.role === "STUDENT" ? userForm.classId : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setMessage(`User "${data.name}" created. Username: ${data.username}`);
    setUserForm({
      name: "",
      username: "",
      password: "",
      role: "STUDENT",
      classId: "",
      classIds: [],
    });
    load();
  }

  function toggleTeacherClass(classId: string) {
    setUserForm((prev) => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter((id) => id !== classId)
        : [...prev.classIds, classId],
    }));
  }

  return (
    <DashboardLayout slug={slug} schoolName={schoolName} userName={userName} role="PRINCIPAL">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Principal Dashboard</h1>
        <p className="text-slate-500">Manage classes, create user accounts, and oversee your school.</p>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mb-6 flex gap-2">
        <Button
          variant={tab === "users" ? "primary" : "secondary"}
          onClick={() => { setTab("users"); setMessage(""); setError(""); }}
        >
          Users
        </Button>
        <Button
          variant={tab === "classes" ? "primary" : "secondary"}
          onClick={() => { setTab("classes"); setMessage(""); setError(""); }}
        >
          Classes
        </Button>
      </div>

      {tab === "classes" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Create class">
            <div className="space-y-4">
              <Input
                label="Class name"
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                placeholder="Grade 11A"
              />
              <Button onClick={createClass}>Create class</Button>
            </div>
          </Card>
          <Card title="All classes">
            <div className="space-y-2">
              {classes.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="font-medium">{c.name}</span>
                  <Badge>{c._count.students} students</Badge>
                </div>
              ))}
              {classes.length === 0 && (
                <p className="text-sm text-slate-400">No classes yet. Create Grade 10A, 11B, etc.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {tab === "users" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Create user account">
            <div className="space-y-4">
              <Input
                label="Full name"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              />
              <Input
                label="Username"
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
              />
              <Input
                label="Password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              />
              <Select
                label="Role"
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="STAFF">Non-academic staff</option>
              </Select>

              {userForm.role === "STUDENT" && (
                <Select
                  label="Class"
                  value={userForm.classId}
                  onChange={(e) => setUserForm({ ...userForm, classId: e.target.value })}
                >
                  <option value="">Select class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              )}

              {userForm.role === "TEACHER" && classes.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Assign classes</p>
                  <div className="space-y-2">
                    {classes.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={userForm.classIds.includes(c.id)}
                          onChange={() => toggleTeacherClass(c.id)}
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={createUser}>Create user</Button>
            </div>
          </Card>

          <Card title="All users">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.map((u) => (
                <div key={u.id} className="rounded-lg bg-slate-50 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{u.name}</span>
                    <Badge color="indigo">{u.role}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    @{u.username}
                    {u.class && ` · ${u.class.name}`}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
