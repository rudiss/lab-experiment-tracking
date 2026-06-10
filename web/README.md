# Lab Tracker — Web UI

A Next.js (App Router) front end for the [laboratory experiment tracking data model](../README.md).
It provides full CRUD over every entity in the model and demonstrates the schema's design — most
notably the **type-aware measurement form**, which adapts its inputs to the selected measurement
type's `value_kind` and constrains categorical values to the catalog's `allowed_categories`.

> A browser can't talk to Postgres directly, so this app is the server layer: React Server
> Components read the database through Prisma, and Server Actions perform mutations. The browser
> only ever calls the server.

## Stack

- **Next.js 16** (App Router, React Server Components, Server Actions)
- **React 19**, **Tailwind CSS v4**
- **Prisma** against the same Postgres the root project provisions

## Running it

From the **repo root**, start the database (this also applies migrations + seed):

```bash
docker compose up --build        # Postgres on localhost:5432, schema + seed loaded
```

Then run the web app:

```bash
cd web
npm install                      # also syncs the schema + generates the Prisma client
npm run dev                      # http://localhost:3000
```

`web/.env` already points at `postgresql://lab:lab@localhost:5432/lab`. Production build:
`npm run build && npm run start`.

## How it connects to the model

The **root** `prisma/schema.prisma` is the single source of truth and owns migrations. This app
does **not** define or migrate the schema — on `postinstall`/`predev`/`prebuild` it runs
`scripts/pull-schema.mjs`, which copies the root schema into `web/prisma/schema.prisma` (gitignored)
and regenerates the Prisma client into `web/node_modules`. So the UI always reflects the canonical
schema, and there's no second copy to drift.

## Features

| Area | Routes | Notes |
|---|---|---|
| Dashboard | `/` | Counts, projects-by-status, measurements-by-type, recent experiments |
| Projects | `/projects` | CRUD + member management (add/remove, toggle lead), experiments list |
| Experiments | `/experiments` | CRUD, project-scoped **follow-up** parent picker, sample linking, measurements |
| Measurements | `/measurements` | CRUD with the **type-aware form**, filters by experiment/type |
| Samples | `/samples` | CRUD, usage across experiments, measurements taken from it |
| Researchers | `/researchers` | CRUD with role |
| Catalog | `/catalog/*` | Roles, Specimen Types, Measurement Types (the extensible reference tables) |

## How integrity is enforced (defense in depth)

1. **UI** — the measurement form only offers valid categories and the right value input per kind.
2. **Server Action** — re-derives `value_kind` from the catalog (never trusts the client) and
   validates the categorical value against `allowed_categories` (`src/app/measurements/actions.ts`).
3. **Database** — the composite FK + CHECK constraints from the schema are the final backstop, so
   even a direct SQL write can't store an inconsistent measurement.

## Layout

```
web/
├── src/
│   ├── app/                 # routes (one folder per entity; actions.ts + pages)
│   ├── components/          # ui.tsx primitives, Nav, SubmitButton, DeleteButton
│   └── lib/                 # prisma client, form parsing, formatting, enums, errors
├── scripts/pull-schema.mjs  # syncs the root schema + generates the client
└── prisma/schema.prisma     # generated copy (gitignored)
```
