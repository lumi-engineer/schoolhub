# SchoolHub — Multi-Tenant School Platform

A web application where schools and academies can register, get their own subdomain, and manage students, teachers, staff, tasks, and communication.

## Features

- **School registration** — Each school gets a unique subdomain (e.g. `springfield-high.schoolapp.local`)
- **Principal dashboard** — Create classes (Grade 11A, 10B, etc.) and user accounts with passwords
- **Teacher portal** — View assigned classes, assign tasks to classes or individual students, chat with students and staff
- **Student portal** — View assigned tasks, mark them complete, message teachers
- **Staff portal** — Staff lounge chat with principals, teachers, and non-academic staff
- **Group chats** — Staff Lounge (all staff) and Teachers Lounge (principal + teachers)
- **Direct messages** — One-on-one chat between any users

## Quick Start

```bash
cd school-platform
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to register a school.

## Usage Flow

1. **Register** — Create your school on the home page with principal credentials
2. **Login** — Go to `/s/your-slug/login` (or `your-slug.localhost:3000` with subdomain setup)
3. **Principal** — Create classes, then create student/teacher/staff accounts
4. **Teachers** — Assign tasks, view classes, use chat
5. **Students** — Complete tasks, message teachers

## Subdomain Setup (optional)

For true subdomain routing in development, add entries to your hosts file:

```
127.0.0.1 springfield-high.localhost
```

Then visit `http://springfield-high.localhost:3000` — middleware rewrites to the school login.

Without subdomains, use path-based URLs: `http://localhost:3000/s/springfield-high/login`

## Tech Stack

- Next.js 16 (App Router)
- Prisma + SQLite
- Tailwind CSS
- JWT session cookies
- bcrypt password hashing

## Production Notes

- Change `JWT_SECRET` in `.env`
- Use PostgreSQL instead of SQLite for production (`DATABASE_URL`)
- Deploy with wildcard DNS (`*.yourdomain.com`) for subdomain routing
