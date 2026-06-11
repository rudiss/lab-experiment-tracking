# Laboratory Experiment Tracking System

Tracking a research lab's experiments: researchers, projects, experiments, samples, and the
measurements those experiments produce. The repository has **two parts**:

- **Data model** — the Postgres schema, defined with [Prisma](https://www.prisma.io/) (PostgreSQL
  provider) and applied as versioned SQL migrations, with seed data. Runs entirely in Docker.
  *This is the core of the project, and most of this README is about it.*
- **Web UI** ([`web/`](web/)) — a [Next.js](https://nextjs.org/) app providing full CRUD over the
  model. Optional; reuses the same schema and Postgres. See [The web UI](#the-web-ui) and
  [`web/README.md`](web/README.md).

---

## Quick start

**Prerequisites:** [Docker](https://docs.docker.com/) (with Compose v2) for the database;
[Node.js](https://nodejs.org/) 20+ only if you also want to run the web UI.

### 1. Start the database

```bash
docker compose up --build
```

That single command:

1. starts Postgres (`db`),
2. waits for it to be healthy, then runs `prisma migrate deploy` (schema) and
   `prisma db seed` (seed data) in the one-shot `migrate` container,
3. the `migrate` container exits `0`; **the `db` keeps running with schema + seed loaded.**

Connect to it directly:

```bash
psql postgresql://lab:lab@localhost:5432/lab
# or:  docker compose exec db psql -U lab -d lab
```

Reset to a clean slate (drops the data volume, so the next `up` re-migrates and re-seeds):

```bash
docker compose down -v
```

> The seed is idempotent — re-running `docker compose up` on an already-seeded database skips
> seeding rather than duplicating. Use `down -v` to start over.

### 2. (Optional) Run the web UI

With the database from step 1 running:

```bash
cd web
npm install        # also syncs the schema + generates the Prisma client
npm run dev        # http://localhost:3000
```

`web/.env` already points at the Postgres above. See [The web UI](#the-web-ui) for what it does.

---

## The data model

```mermaid
erDiagram
    roles                ||--o{ researchers         : classifies
    researchers          ||--o{ project_researchers : "member of"
    projects             ||--o{ project_researchers : "has member"
    projects             ||--o{ experiments         : contains
    experiments          ||--o{ experiment_samples  : uses
    samples              ||--o{ experiment_samples  : "used in"
    specimen_types       ||--o{ samples             : classifies
    experiments          ||--o{ measurements        : produces
    samples              ||--o{ measurements        : "measured from (optional)"
    measurement_types    ||--o{ measurements        : "typed by"
    experiments          ||--o{ experiments         : "follow-up of"

    researchers {
        int    id PK
        string email UK
        int    role_id FK
    }
    projects {
        int            id PK
        project_status status
    }
    project_researchers {
        int     project_id PK_FK
        int     researcher_id PK_FK
        boolean is_lead
    }
    experiments {
        int               id PK
        int               project_id FK
        int               parent_experiment_id FK "self, nullable"
        experiment_status status
    }
    samples {
        int    id PK
        string sample_code UK
        int    specimen_type_id FK
    }
    measurement_types {
        int                    id PK
        string                 name UK
        measurement_value_kind value_kind
        string                 allowed_categories "text[]"
    }
    measurements {
        int                    id PK
        int                    experiment_id FK
        int                    sample_id FK "nullable"
        int                    measurement_type_id FK
        measurement_value_kind value_kind
        decimal                numeric_value
        string                 categorical_value
        string                 text_value
    }
```

**Entities**

| Table | Purpose |
|---|---|
| `roles` | Lab roles (PI, technician, grad student, …). Reference table. |
| `researchers` | Scientists; each has a current `role`. |
| `projects` | Research initiatives with a `planning → active → completed/cancelled` lifecycle. |
| `project_researchers` | M2M membership; `is_lead` marks the project lead. |
| `experiments` | Belong to exactly one project; carry a hypothesis, dates, status, and an optional `parent_experiment_id` (a follow-up of an earlier experiment). |
| `specimen_types` | Kinds of specimen (blood, soil, …). Reference table. |
| `samples` | Physical specimens with a unique `sample_code`, storage, collection time. |
| `experiment_samples` | M2M: experiments use many samples; a sample is used across many experiments. |
| `measurement_types` | **Catalog** of measurement kinds; new kinds are rows, not migrations. |
| `measurements` | Data points (numeric / categorical / text) tied to an experiment and usually a sample. |

### Measurement integrity (the design's centerpiece)

Measurements come in three shapes — **numeric** (with a unit), **categorical**, and
**free text** — and *new kinds are added occasionally*. The model stores them in **one table
with typed value columns** (`numeric_value`, `categorical_value`, `text_value`) plus a
`measurement_types` **catalog**. A new kind (a spectrum, an image path, a new assay readout) is
an `INSERT` into `measurement_types`, never a schema change.

Consistency is enforced **declaratively, without triggers**, by two cooperating mechanisms:

1. **Composite foreign key** `measurements(measurement_type_id, value_kind)` →
   `measurement_types(id, value_kind)`. A measurement's `value_kind` *cannot* disagree with its
   catalog type.
2. **CHECK constraint**: exactly the one value column that matches `value_kind` is populated and
   the others are `NULL` (and a `unit` may only accompany a numeric reading).

Together these make every stored measurement provably consistent with its declared type. All
four bad-write cases are rejected by the database:

| Attempted write | Rejected by |
|---|---|
| `value_kind` disagrees with the catalog type | composite FK |
| populated column doesn't match `value_kind` | CHECK |
| more than one value column populated | CHECK |
| no value column populated | CHECK |

The one rule *not* enforced in-DB is that a `CATEGORICAL` value falls within the type's
`allowed_categories` — a conditional foreign key can't express that. It's left to the application
layer; the [web UI](#the-web-ui) implements it (its Server Actions validate the value, and the
form only offers valid options), and whether to *also* enforce it in the database is an
[open question](#open-questions-for-the-lab).

---

## The web UI

A [Next.js 16](https://nextjs.org/) (App Router) app in [`web/`](web/) with full CRUD over every
entity in the model. A browser can't talk to Postgres directly, so the app *is* the server layer:
React Server Components read the database through Prisma, and Server Actions perform the writes —
the browser only ever calls the server.

![Lab Tracker dashboard](docs/dashboard.png)

**Stack:** Next.js 16 · React 19 · Tailwind CSS v4 · Prisma (against the same Postgres).

**What it covers**

| Area | Highlights |
|---|---|
| Dashboard | Counts, projects-by-status, measurements-by-type, recent experiments |
| Projects | CRUD + member management (add/remove, toggle lead) |
| Experiments | CRUD, project-scoped **follow-up** parent picker, sample linking |
| Measurements | CRUD with a **type-aware form**, filters by experiment/type |
| Samples | CRUD, usage across experiments |
| Researchers | CRUD with role |
| Catalog | Roles, Specimen Types, Measurement Types (the extensible reference tables) |

**The type-aware measurement form** is the piece that best exercises the model: choosing a
measurement type switches the value input to numeric + unit, a constrained category dropdown, or
free text depending on the type's `value_kind`, and a categorical type only offers its
`allowed_categories`.

**Single source of truth.** The root [`prisma/schema.prisma`](prisma/schema.prisma) owns the
schema and migrations. The web app does **not** define or migrate it — on `postinstall` /
`predev` / `prebuild` it runs [`web/scripts/pull-schema.mjs`](web/scripts/pull-schema.mjs), which
copies the root schema into `web/prisma/schema.prisma` (gitignored) and regenerates the Prisma
client. So the UI always reflects the canonical schema, with no second copy to drift.

**Integrity is defense-in-depth:** the form offers only valid inputs → the Server Action
re-derives `value_kind` from the catalog and validates the categorical value against
`allowed_categories` → the schema's composite FK + CHECK are the final backstop, so even a direct
SQL write can't store an inconsistent measurement.

Full detail in [`web/README.md`](web/README.md).

---

## Assumptions

The brief is intentionally incomplete. Decisions made, to keep moving:

- **Roles** are a reference table, and each researcher has a **single current role**. Role
  history over time is not tracked.
- **Project membership** is many-to-many; `is_lead` marks the lead/PI on a project, which is
  distinct from a researcher's lab role (lead-ness is per project).
- **Projects have no dates** — the brief gives dates only to experiments — so projects carry
  status but not start/end dates.
- **Follow-ups** are modeled as a single `parent_experiment_id` self-reference (a chain/tree),
  not many-to-many lineage.
- An **experiment belongs to exactly one project** (`project_id NOT NULL`).
- A **sample** has a lab-assigned unique `sample_code`; `storage_location` is free text (no
  separate storage-location entity).
- A **measurement** is tied to exactly one experiment (`NOT NULL`) and **optionally** to a
  sample (`sample_id` nullable) — the brief says it *usually* references a sample (e.g. an
  ambient temperature reading has none).
- **New measurement kinds are data** (`measurement_types` rows), and `value_kind` is a fixed
  closed set of storage shapes (numeric / categorical / text).
- **Units are free text**, with a default unit on the measurement type; there is no SI/units
  dimensional system.
- **Status sets are fixed enums** (`planning / active / completed / cancelled`).
- **No authentication, users, or permissions** are modeled — researchers are subjects of record,
  not system accounts.
- **No soft-delete**; only `created_at` / `updated_at` are tracked. Deletes follow a clear
  policy: reference tables are `RESTRICT` (can't delete a value in use), ownership chains
  (`project → experiment → measurement`) and join rows `CASCADE`, optional cross-links
  (`measurement.sample`, `experiment.parent`) `SET NULL`.

## Key tradeoffs

- **Measurement storage — typed columns + catalog (chosen)** over the alternatives:
  - *JSONB `value` column* — maximally flexible for new kinds, but loses numeric typing,
    unit handling, and cheap aggregation/indexing; integrity becomes the app's job.
  - *EAV or a table-per-kind* — clean typing, but joins multiply and adding a kind means a
    schema change (table-per-kind) or a sprawl of attribute rows (EAV).

  Typed columns + a catalog keep numeric data first-class and queryable **and** make new kinds
  cheap (a row), which is the combination the brief actually asks for.

- **Integrity — declarative composite-FK + CHECK (chosen)** over a `BEFORE INSERT/UPDATE`
  trigger. A trigger could *also* validate categorical values against `allowed_categories`, but
  it's procedural code to test and maintain. The declarative approach gives database-level
  guarantees with nothing to run; the cost is that the `allowed_categories` check moves to the
  app — a deliberate, documented trade.

- **Enums vs reference tables — hybrid by stability.** Closed, stable lifecycle sets are enums
  (cheap, self-documenting); open-ended domains that grow with the lab's work are reference
  tables (no migration to add a value).

- **Considered and deliberately *not* done: a measurement audit / revision trail.** Measurements
  are treated as immutable inserts. Real labs correct and retract results, which would call for
  versioning (a `superseded_by` link, valid-time columns, or an append-only history table). It's
  out of scope for this cut and flagged as the first thing to revisit (see open questions).

## Open questions for the lab

1. **Per-experiment attribution** — do we need to record *which* researcher ran an experiment or
   recorded a measurement, beyond project membership? (Would add an experiment↔researcher link.)
2. **Corrections & retractions** — are measurements ever amended after the fact? If so we need a
   revision/audit model.
3. **Sample lifecycle** — are samples consumed/aliquoted (volume tracking, depletion)? Do derived
   samples (aliquots, extracts) need parent→child lineage?
4. **Projects** — do they need start/target/end dates, funding/grant info, or an owning PI field
   distinct from membership?
5. **Units** — free text, or a controlled vocabulary / SI normalization so readings are
   comparable across experiments?
6. **Categorical domains** — should `allowed_categories` be enforced in the database (trigger or
   a categories child table), or is app-level validation acceptable?
7. **Experiment lineage** — can an experiment be a follow-up to *more than one* prior experiment
   (merging lines of inquiry)? That would make lineage many-to-many.
8. **Multi-tenancy** — one lab, or many sharing this system (data isolation)?
9. **Scale** — expected measurement volume? High-frequency instrument data could push toward
   time-series partitioning of `measurements`.

---

## Project layout

```
.
├── docker-compose.yml          # db + one-shot migrate/seed service
├── Dockerfile                  # Node image that runs migrate deploy + seed
├── prisma/
│   ├── schema.prisma           # the data model — single source of truth
│   ├── seed.ts                 # TypeScript seed via the Prisma client
│   └── migrations/
│       ├── 20260610201734_init/                  # generated baseline DDL
│       └── 20260610201749_measurement_integrity/ # raw SQL: CHECKs the DSL can't express
├── web/                        # Next.js web UI (see web/README.md)
│   ├── src/app/                # routes — one folder per entity (actions.ts + pages)
│   ├── src/components/         # UI primitives, Nav, form buttons
│   ├── src/lib/                # Prisma client, form parsing, formatting, enums
│   └── scripts/pull-schema.mjs # syncs the root schema + generates the client
├── package.json
└── README.md
```

## Iterating on the schema (optional)

You don't need this to run the project, but to change the data model:

```bash
cp .env.example .env                 # points at localhost:5432
docker compose up -d db              # just Postgres
npm install
npx prisma migrate dev               # create/apply migrations against the local db
npx prisma db seed                   # load seed data
npx prisma studio                    # browse the data in a GUI
```

**Adding a new measurement kind requires no migration** — insert a `measurement_types` row
(e.g. `('Spectrum Path', 'TEXT', NULL, '{}', '...')`) and start recording measurements against
it. That's the extensibility claim, verifiable live.
