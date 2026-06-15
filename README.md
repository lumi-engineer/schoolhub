# SchoolHub — Multi-Tenant School Platform

A web application where schools and academies can register, get their own subdomain, and manage students, teachers, staff, tasks, and communication.

## Features

- **School registration** — Each school gets a unique subdomain (e.g. `springfield-high.yourdomain.com`)
- **Principal dashboard** — Create classes (Grade 11A, 10B, etc.) and user accounts with passwords
- **Teacher portal** — View assigned classes, assign tasks to classes or individual students, chat with students and staff
- **Student portal** — View assigned tasks, mark them complete, message teachers
- **Staff portal** — Staff lounge chat with principals, teachers, and non-academic staff
- **Group chats** — Staff Lounge (all staff) and Teachers Lounge (principal + teachers)
- **Direct messages** — One-on-one chat between any users

## Quick Start (local)

```bash
npm install
cp .env.example .env
# Edit .env with your PostgreSQL DATABASE_URL and JWT_SECRET
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to register a school.

## Deploy to Vercel

SQLite does **not** work on Vercel. Use a hosted PostgreSQL database (Neon is free and works well).

### 1. Create a Neon database

1. Go to [neon.tech](https://neon.tech) and create a project
2. Copy the **pooled** connection string (starts with `postgresql://`)

### 2. Set Vercel environment variables

In your Vercel project → **Settings → Environment Variables**, add:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Your Neon pooled PostgreSQL URL |
| `JWT_SECRET` | A long random string (e.g. from `openssl rand -base64 32`) |

### 3. Redeploy

Push to GitHub or click **Redeploy** in Vercel. The build runs `prisma db push` to create tables automatically.

### Subdomain routing on Vercel

`your-app.vercel.app` is **not** treated as a school subdomain — the landing page loads normally.

For per-school subdomains in production, point a wildcard DNS record (`*.yourdomain.com`) to Vercel and set:

```
ROOT_DOMAIN=yourdomain.com
```

## Usage Flow

1. **Register** — Create your school on the home page with principal credentials
2. **Login** — Go to `/s/your-slug/login` (or `your-slug.localhost:3000` in dev with hosts file)
3. **Principal** — Create classes, then create student/teacher/staff accounts
4. **Teachers** — Assign tasks, view classes, use chat
5. **Students** — Complete tasks, message teachers

## Subdomain Setup (local dev)

Add to your hosts file:

```
127.0.0.1 springfield-high.localhost
```

Then visit `http://springfield-high.localhost:3000`

Without subdomains, use path-based URLs: `http://localhost:3000/s/springfield-high/login`

## Tech Stack

- Next.js 16 (App Router)
- Prisma + PostgreSQL
- Tailwind CSS
- JWT session cookies
- bcrypt password hashing
