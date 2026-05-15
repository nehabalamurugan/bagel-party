#!/usr/bin/env python3
"""Integration tests against the live Supabase backend. Cleans up after itself."""
import json, os, sys, urllib.request, urllib.error

env = {}
with open(os.path.join(os.path.dirname(__file__), "..", ".env.local")) as f:
    for line in f:
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            env[k] = v

BASE = env["NEXT_PUBLIC_SUPABASE_URL"] + "/rest/v1"
KEY = env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]

def req(method, path, body=None, prefer=None):
    url = BASE + path
    headers = {
        "apikey": KEY,
        "Authorization": "Bearer " + KEY,
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            txt = resp.read().decode()
            return resp.status, (json.loads(txt) if txt.strip() else None)
    except urllib.error.HTTPError as e:
        txt = e.read().decode()
        return e.code, txt

results = []
def check(name, cond, detail=""):
    results.append((cond, name, detail))
    print(("PASS " if cond else "FAIL ") + name + ("  -- " + str(detail) if detail else ""))

# cleanup leftovers
req("DELETE", "/guests?name=eq.__test_harness__")

# 1. insert guest
st, g = req("POST", "/guests", {"name": "__test_harness__", "flight": [1,2,3,4,5,6]},
            prefer="return=representation")
check("anon can insert guest", st in (200,201), st)
gid = g[0]["id"] if isinstance(g, list) else None
check("guest row has uuid id", bool(gid), gid)
check("guest flight stored as int[]", isinstance(g[0]["flight"], list) and g[0]["flight"]==[1,2,3,4,5,6], g[0].get("flight"))

# 2. insert round1 votes
st, _ = req("POST", "/votes_round1", [{"guest_id": gid, "cheese_number": 1},
                                      {"guest_id": gid, "cheese_number": 2}])
check("anon can insert votes_round1", st in (200,201), st)

# 3. insert round2 vote, valid category
st, _ = req("POST", "/votes_round2", [{"guest_id": gid, "category": "wildest", "cheese_number": 1}])
check("anon can insert votes_round2", st in (200,201), st)

# 4. bogus category — is the column constrained? (app relies on app-level enum only)
st, body = req("POST", "/votes_round2", [{"guest_id": gid, "category": "BOGUS_NOT_A_CATEGORY", "cheese_number": 999}])
check("votes_round2.category accepts arbitrary text (no DB constraint)", st in (200,201),
      f"status={st} -> app-layer trust only")

# 5. FK enforcement: vote with nonexistent guest
st, body = req("POST", "/votes_round1", [{"guest_id": "00000000-0000-0000-0000-000000000999", "cheese_number": 5}])
check("votes_round1 FK to guests is enforced", st >= 400, f"status={st}")

# 6. upsert config (mimics patchConfig)
st, cfg = req("POST", "/config", {"id": 1, "total_cheeses": 4},
              prefer="resolution=merge-duplicates,return=representation")
check("anon can upsert config (patchConfig path)", st in (200,201), st)

# 7. config singleton: can a second row be inserted? (id PK should block via upsert; raw insert id=2 would succeed)
st, _ = req("POST", "/config", {"id": 2, "total_cheeses": 99}, prefer="return=representation")
check("config allows extra rows beyond id=1 (singleton not DB-enforced)", st in (200,201),
      f"status={st} -> id=1 convention is app-layer only")
if st in (200,201):
    req("DELETE", "/config?id=eq.2")

# 8. FK cascade on guest delete
st, _ = req("DELETE", "/guests?id=eq." + gid)
check("anon can delete guest", st in (200,204), st)
st, r1left = req("GET", "/votes_round1?guest_id=eq." + gid + "&select=id")
st, r2left = req("GET", "/votes_round2?guest_id=eq." + gid + "&select=id")
check("deleting guest cascades to votes_round1", r1left == [], r1left)
check("deleting guest cascades to votes_round2", r2left == [], r2left)

# final cleanup
req("DELETE", "/votes_round1?cheese_number=eq.5")
req("DELETE", "/guests?name=eq.__test_harness__")

st, guests = req("GET", "/guests?select=*")
st, v1 = req("GET", "/votes_round1?select=*")
st, v2 = req("GET", "/votes_round2?select=*")
st, cfg = req("GET", "/config?select=*")
check("DB clean after tests: guests empty", guests == [], guests)
check("DB clean after tests: votes_round1 empty", v1 == [], v1)
check("DB clean after tests: votes_round2 empty", v2 == [], v2)
print("\nfinal config:", cfg)

passed = sum(1 for ok,_,_ in results if ok)
print(f"\n{passed}/{len(results)} checks passed")
sys.exit(0 if passed == len(results) else 1)
