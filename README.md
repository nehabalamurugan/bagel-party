# Schmear & Schmooze 🥯

A mobile-first web app for running a self-paced cream cheese tasting tournament at a party. Each guest does **3 rounds × 3 tastings = 9 samples**, rates each on stars, and optionally nominates cheeses for awards.

- **Self-paced tasting**: guests pick which cheeses to try, rate 1–5 stars, optionally nominate for one of 4 categories.
- **Soft cap + suggestions**: live counter + "needs tasters" chips spread the load without ever blocking a guest.
- **Live leaderboard**: overall winner = highest average stars (min N raters); category winners by nomination count.

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

1. Create a new Supabase project (free tier is plenty).
2. Run this SQL in the **SQL Editor**. **This drops any old schema from previous versions** — if you have real data you care about, back it up first.

```sql
-- Wipe any older schema from earlier versions of this app
drop table if exists votes_round1;
drop table if exists votes_round2;
drop table if exists tastings;
drop table if exists guests;
drop table if exists config;

create table config (
  id int primary key default 1,
  total_cheeses int default 0,
  tasting_open boolean default false,
  results_revealed boolean default false,
  per_cheese_cap int default 20,
  min_raters_to_qualify int default 5
);

insert into config (id) values (1) on conflict do nothing;

create table guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table tastings (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references guests(id) on delete cascade,
  cheese_number int not null,
  stars int not null check (stars between 1 and 5),
  nomination text check (nomination in (
    'erewhon', 'dining_hall', 'wildest', 'should_not_exist'
  )),
  round_number int not null check (round_number between 1 and 3),
  created_at timestamptz default now(),
  unique (guest_id, cheese_number)
);

-- We're not using Supabase auth; relax RLS so the anon key can read+write.
alter table config   disable row level security;
alter table guests   disable row level security;
alter table tastings disable row level security;

-- Realtime for the live leaderboard + soft-cap counter.
alter publication supabase_realtime add table config, guests, tastings;
```

3. **Verify Realtime is on.** The SQL above already runs `alter publication supabase_realtime add table …` so this is usually done automatically. To double-check: Dashboard → **Database → Publications** → click `supabase_realtime` → confirm `config`, `guests`, and `tastings` are all enabled. (Don't confuse this with **Database → Replication**, which is for external read replicas / CDC, not Realtime.) Easiest live test: open `/leaderboard` in one tab and flip a toggle on `/admin` in another — the leaderboard should update without a refresh.

4. Copy the project URL and `anon` key from Settings → API into `.env.local`.

## Running the event

1. Go to **`/admin`** on your phone, enter the host password.
2. **01 · SETUP** — set:
   - **total cream cheeses** (e.g. 30)
   - **per-cheese soft cap** (default 20 — when a cheese hits this many raters, guests get nudged toward less-tried ones)
   - **min raters to qualify** (default 5 — cheeses with fewer raters won't appear in the overall ranking)
3. **02 · TASTING** — click **OPEN_TASTING**. Send guests to the root URL.
4. Each guest enters their name and walks through 9 tastings (3 rounds × 3, with a palate-cleanse screen between rounds).
5. Watch the live count climb on `/admin` or `/leaderboard`.
6. When the room has finished, click **REVEAL_RESULTS** in **03 · RESULTS**. The leaderboard switches from "PRELIMINARY" to the certified overall winner + category winners.

Project **`/leaderboard`** on a TV. It updates live via Supabase Realtime.

## Routes

| Route          | Purpose                                       |
|----------------|-----------------------------------------------|
| `/`            | Guest entry (name + consent)                  |
| `/taste`       | The 9-tasting flow (cheese # → stars → nominate) |
| `/leaderboard` | Big projectable live results                  |
| `/admin`       | Host dashboard (password-gated)               |

## How the soft cap works

When a guest types a cheese number on `/taste`:
- The page shows `12 others have tasted this` in real time (Supabase Realtime sub).
- If that count is at/over the cap, the message switches to red: `⚠ N others tasted this — try a less-rated # ↑`.
- Submit is **not** blocked — the warning is a nudge.
- A "needs tasters" strip at the top suggests the 5 lowest-count cheeses, excluding ones the guest has already tasted, with a tap-to-fill shortcut.

This spreads coverage without ever embarrassing a guest mid-flow.

## Winner calculation

- **Overall winner**: highest average stars among cheeses with `count >= min_raters_to_qualify`. The threshold prevents a 5.00★ cheese rated once from beating a 4.85★ rated by 20 people.
- **Category winners**: most nominations per category. Ties broken by whichever sample the database returns first — fine for a party.

## Deploy to Vercel

1. Push this directory to a GitHub repo.
2. On vercel.com → New Project → import the repo.
3. Set the three env vars from `.env.local` in **Project Settings → Environment Variables**.
4. Deploy. You get a `https://<project>.vercel.app` URL — that's the link to share with guests.

## Notes / non-goals

- No real auth. Guest identity lives in `localStorage` (`schmear:guest`). Clearing storage gets a guest a fresh start (but their old tastings stay in the DB attached to the old guest_id).
- The admin password is client-side. Not secure against a determined attacker, fine for a party.
- The unique constraint `(guest_id, cheese_number)` prevents a guest from rating the same cheese twice.
- Reset via the danger zone wipes guests + tastings but keeps the config (total/cap/min).
