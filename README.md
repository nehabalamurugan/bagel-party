# Schmear & Schmooze 🥯

A mobile-first web app for running a cream cheese tasting tournament at a party. Two rounds, an unknown number of cream cheeses, ~120 guests.

- **Round 1 (Flights):** every guest gets 6 random cream cheese numbers and picks their top 2.
- **Round 2 (Finals):** top 12 from Round 1 advance. Guests vote across 5 categories.
- **Live leaderboard** that's projectable on a TV.

Stack: Next.js (App Router) · TypeScript · Tailwind · Supabase · Vercel.

---

## Quick start

```bash
npm install
cp .env.local.example .env.local
# fill in your Supabase URL + anon key
npm run dev
```

Open <http://localhost:3000>.

## Environment variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_ADMIN_PASSWORD=schmear2026
```

The admin password is client-side only — fine for a one-day event. Change it before the party.

## Supabase setup

1. Create a new Supabase project (the free tier is plenty).
2. Run this SQL in the **SQL Editor**:

```sql
create table if not exists config (
  id int primary key default 1,
  total_cheeses int default 0,
  round_1_open boolean default false,
  round_2_open boolean default false,
  results_revealed boolean default false,
  finalist_ids int[] default '{}'
);

insert into config (id) values (1) on conflict do nothing;

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  flight int[] not null,
  created_at timestamptz default now()
);

create table if not exists votes_round1 (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references guests(id) on delete cascade,
  cheese_number int not null,
  created_at timestamptz default now()
);

create table if not exists votes_round2 (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references guests(id) on delete cascade,
  category text not null,
  cheese_number int not null,
  created_at timestamptz default now()
);

-- We're not using Supabase auth; relax RLS so the anon key can read+write.
alter table config       disable row level security;
alter table guests       disable row level security;
alter table votes_round1 disable row level security;
alter table votes_round2 disable row level security;

-- Enable Realtime so the leaderboard auto-updates on the TV. Without this,
-- the projector page freezes between manual reloads.
alter publication supabase_realtime add table config, guests, votes_round1, votes_round2;
```

3. **Verify Realtime is on** — Dashboard → Database → Replication → `supabase_realtime` should list all four tables. (The SQL above adds them; the dashboard toggle is the GUI alternative.) Test by opening `/leaderboard` and watching the "updated HH:MM" tape; if it doesn't tick when guests submit, replication isn't enabled.

4. Copy the project URL and `anon` key from Settings → API into `.env.local`.

## Running the event

1. Go to **`/admin`** on your phone, enter the host password.
2. Set the **total number of cream cheeses** (e.g. 60). Save.
3. Click **Open Round 1**. Send guests to the root URL.
4. Each guest enters their name and gets a flight of 6 numbers.
5. Watch the live count climb on `/admin` or `/leaderboard`.
6. When most guests have voted, click **Close R1 + pick top 12**.
7. Click **Open Round 2**. Guests revisit (their session is in localStorage; existing flights still load — they'll just navigate to `/finals`). New finals tab will only let them in once Round 2 is open.
8. When everyone has voted, click **Reveal results**.

Project the **`/leaderboard`** page on a TV. It updates live via Supabase Realtime.

## Routes

| Route          | Purpose                                       |
|----------------|-----------------------------------------------|
| `/`            | Guest entry → assigns flight                  |
| `/vote`        | Round 1 voting (pick 2 from your flight of 6) |
| `/finals`      | Round 2 voting (5 categories on finalists)    |
| `/leaderboard` | Big projectable live results                  |
| `/admin`       | Host dashboard (password-gated)               |

## Deploy to Vercel

1. Push this directory to a GitHub repo.
2. On vercel.com → New Project → import the repo.
3. Set the three env vars from `.env.local` in **Project Settings → Environment Variables**.
4. Deploy. You get a `https://<project>.vercel.app` URL — that's the link to share with guests.

Total deploy time: under 10 minutes if Supabase is already set up.

## Flight assignment algorithm

When a guest submits their name:

1. Count current tastings per cheese (how many guests already have each number in their flight).
2. Bucket cheeses by count, shuffle within each bucket, concat in ascending order of count.
3. Take the first 6.

This produces near-even coverage regardless of arrival order — every cheese gets tasted by roughly the same number of guests.

## Notes / non-goals

- No real auth. Guest identity lives in `localStorage` (`schmear:guest`). Clearing storage gets a guest a new flight.
- The admin password is client-side. Not secure against a determined attacker, fine for a party.
- The "close Round 1 + pick top 12" step is a one-shot decision based on total vote count. Tie at #12? Whichever the database returns first wins — for a party, good enough.
- If you reset everything mid-party, send guests to clear their localStorage (or run from incognito).
