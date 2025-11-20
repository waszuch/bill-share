# BillShare

Realtime bill sharing application with authentication and database persistence. Built with Next.js 16, TypeScript, tRPC, Prisma ORM, Supabase, and shadcn/ui.

## Features

- Create and join rooms with unique 8-character codes
- Add, edit, and delete expenses (description, amount, payer)
- Split expenses equally between participants
- Real-time balance calculations showing who owes whom
- Automatic settlement calculations
- Realtime updates via Supabase (changes sync instantly across devices)
- User authentication with Google OAuth
- Database persistence with Postgres
- Form validation with Zod
- Toast notifications with Sonner
- Fully responsive design for mobile and desktop

## Development

```bash
pnpm dev
```

Open http://localhost:3000

## Build

```bash
pnpm build
pnpm start
```

## Database

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema changes
pnpm db:push

# Open Prisma Studio
pnpm db:studio
```

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **tRPC v11** with TanStack React Query
- **Prisma ORM**
- **Supabase** (Auth + Postgres + Realtime)
- **Zod**
- **Tailwind CSS**
- **shadcn/ui**
- **Sonner** (Toast notifications)
- **Lucide Icons**

