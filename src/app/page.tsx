"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export default function HomePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    principalName: "",
    principalUsername: "",
    principalPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !prev.slug) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Registration failed.");
      return;
    }
    router.push(`/s/${data.slug}/login`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <header className="mb-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white">
            S
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            SchoolHub
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Register your school or academy, get your own subdomain, and manage students,
            teachers, tasks, and staff communication in one place.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Register your school</h2>
            <p className="mt-2 text-sm text-slate-500">
              Create your school portal and principal account. You&apos;ll get a subdomain like{" "}
              <span className="font-mono text-indigo-600">yourschool.schoolapp.local</span>
            </p>

            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              <Input
                label="School / Academy name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Springfield High School"
                required
              />
              <Input
                label="Subdomain"
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="springfield-high"
                required
              />
              <Input
                label="Principal / person in charge — full name"
                value={form.principalName}
                onChange={(e) => update("principalName", e.target.value)}
                placeholder="Jane Smith"
                required
              />
              <Input
                label="Principal username"
                value={form.principalUsername}
                onChange={(e) => update("principalUsername", e.target.value)}
                placeholder="principal"
                required
              />
              <Input
                label="Principal password"
                type="password"
                value={form.principalPassword}
                onChange={(e) => update("principalPassword", e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={6}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create school portal"}
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Already registered?</h2>
              <p className="mt-2 text-sm text-slate-500">
                Log in at your school&apos;s subdomain or use the path below.
              </p>
              <div className="mt-4 space-y-3">
                <Input
                  label="School subdomain"
                  id="login-slug"
                  placeholder="springfield-high"
                />
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    const slug = (document.getElementById("login-slug") as HTMLInputElement)?.value;
                    if (slug) router.push(`/s/${slug}/login`);
                  }}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Go to school login
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-8">
              <h3 className="font-semibold text-indigo-900">What you get</h3>
              <ul className="mt-4 space-y-3 text-sm text-indigo-800">
                <li>✓ Custom subdomain for each school</li>
                <li>✓ Principal dashboard to create users & classes</li>
                <li>✓ Teacher portal — assign tasks, manage classes</li>
                <li>✓ Student portal — view tasks, message teachers</li>
                <li>✓ Staff lounge & teachers lounge chat</li>
                <li>✓ Role-based interfaces for every user type</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
