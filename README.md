# Clientops

A Next.js client operations dashboard for freelancers and small agencies. Manage clients, projects, invoices, tasks, and revenue in one place.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** [Stack Auth](https://stack-auth.com)
- **Styling:** Tailwind CSS 4

## Prerequisites

- Node.js 18+
- PostgreSQL database
- [Stack Auth](https://stack-auth.com) account (for authentication)

## Setup

### 1. Clone and install

```bash
git clone <repository-url>
cd clientops
npm install
```

### 2. Environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://user:password@localhost:5432/clientops`) |
| `NEXT_PUBLIC_STACK_PROJECT_ID` | Your Stack Auth project ID from [app.stack-auth.com](https://app.stack-auth.com) |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Your Stack Auth publishable client key |

### 3. Database

Run migrations to create the schema:

```bash
npx prisma migrate dev
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Dashboard** – Overview of clients, projects, invoices, tasks, and activity
- **Clients** – Client directory with company info, contact details, and notes
- **Projects** – Project tracking with status, budget, and tasks
- **Billing** – Invoices with status (draft, sent, paid, overdue)
- **Revenue** – Revenue notes, pipeline tracking, and monthly goals
- **Settings** – Timezone, currency, and default preferences

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Deploy on Vercel

The easiest way to deploy is with [Vercel](https://vercel.com). Add your environment variables in the project settings and connect your repository. See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.
