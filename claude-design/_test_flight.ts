// Integration tests for the flight-assignment algorithm against the live
// Supabase backend. Seeds guests named "__flight_test__" and cleans them up.
// Run: npx tsx --env-file=.env.local claude-design/_test_flight.ts
import { assignFlight } from "../lib/flight";
import { supabase } from "../lib/supabase";

const TAG = "__flight_test__";
let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail: unknown = "") {
  if (cond) {
    pass++;
    console.log("PASS " + name + (detail ? "  -- " + detail : ""));
  } else {
    fail++;
    console.log("FAIL " + name + "  -- " + JSON.stringify(detail));
  }
}

async function cleanup() {
  // delete seeded guests (votes cascade via FK)
  await supabase.from("guests").delete().eq("name", TAG);
}

async function seed(flights: number[][]) {
  const rows = flights.map((flight) => ({ name: TAG, flight }));
  const { error } = await supabase.from("guests").insert(rows);
  if (error) throw new Error("seed failed: " + error.message);
}

async function main() {
  await cleanup(); // start clean

  // guard the DB is actually empty of real guests so seeded data is deterministic
  const { count } = await supabase
    .from("guests")
    .select("*", { count: "exact", head: true });
  check("DB has no pre-existing guests (safe to run integration test)", (count ?? 0) === 0, count);
  if ((count ?? 0) !== 0) {
    console.log("ABORT: real guest data present, refusing to seed.");
    process.exit(1);
  }

  // 1. throws below FLIGHT_SIZE
  let threw = false;
  try {
    await assignFlight(5);
  } catch {
    threw = true;
  }
  check("assignFlight(5) throws (needs >=6 cheeses)", threw);

  // 2. no prior guests -> 6 unique sorted in range, repeatedly
  let ok2 = true;
  for (let t = 0; t < 30; t++) {
    const f = await assignFlight(60);
    if (
      f.length !== 6 ||
      new Set(f).size !== 6 ||
      f.some((n, i) => i > 0 && n <= f[i - 1]) ||
      f.some((n) => n < 1 || n > 60)
    ) {
      ok2 = false;
      check("assignFlight(60) shape", false, f);
      break;
    }
  }
  if (ok2) check("assignFlight(60) x30: always 6 unique, sorted, in range", true);

  // 3. exactly 6 cheeses -> [1..6]
  const f6 = await assignFlight(6);
  check("assignFlight(6) === [1,2,3,4,5,6]", JSON.stringify(f6) === "[1,2,3,4,5,6]", f6);

  // 4. load balancing: cheeses 1-6 heavily tasted -> next flight is 7-12
  await seed([
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
  ]);
  const fLB = await assignFlight(12);
  check(
    "load-balance: 1-6 saturated -> assignFlight(12) returns exactly 7-12",
    JSON.stringify(fLB) === "[7,8,9,10,11,12]",
    fLB,
  );
  await cleanup();

  // 5. partial imbalance: zero-count tier fully included, then next tier
  await seed([
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3],
  ]);
  // counts: {7,8,9,10}=0, {4,5,6}=1, {1,2,3}=2
  const fPI = await assignFlight(10);
  const hasAllZero = [7, 8, 9, 10].every((n) => fPI.includes(n));
  const tier1Count = fPI.filter((n) => [4, 5, 6].includes(n)).length;
  const noTier2 = !fPI.some((n) => [1, 2, 3].includes(n));
  check("partial imbalance: all 4 zero-count cheeses chosen", hasAllZero, fPI);
  check("partial imbalance: exactly 2 from count=1 tier", tier1Count === 2, fPI);
  check("partial imbalance: none from count=2 tier", noTier2, fPI);
  await cleanup();

  // 6. sequential simulation: 60 guests, total=30 -> coverage spread tight
  const total = 30;
  for (let g = 0; g < 60; g++) {
    const f = await assignFlight(total);
    await supabase.from("guests").insert({ name: TAG, flight: f });
  }
  const { data: seeded } = await supabase.from("guests").select("flight").eq("name", TAG);
  const counts = new Map<number, number>();
  for (let n = 1; n <= total; n++) counts.set(n, 0);
  for (const row of seeded ?? []) {
    for (const n of (row.flight as number[]) ?? []) counts.set(n, (counts.get(n) ?? 0) + 1);
  }
  const vals = [...counts.values()];
  const spread = Math.max(...vals) - Math.min(...vals);
  // 60*6/30 = 12 expected per cheese; greedy balancing keeps spread minimal
  check(
    "sequential sim (60 guests / 30 cheeses): coverage spread <= 1",
    spread <= 1,
    `min=${Math.min(...vals)} max=${Math.max(...vals)}`,
  );
  await cleanup();

  // final verification: DB clean
  const { count: finalCount } = await supabase
    .from("guests")
    .select("*", { count: "exact", head: true });
  check("DB clean after flight tests", (finalCount ?? 0) === 0, finalCount);

  console.log(`\n${pass}/${pass + fail} checks passed`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("test harness threw:", e);
  cleanup().finally(() => process.exit(1));
});
