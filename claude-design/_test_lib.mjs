// Unit tests for pure lib logic. Run:
//   node --experimental-test-module-mocks claude-design/_test_lib.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { mock } from "node:test";

// ---- fmtId (pure) ----
const { fmtId } = await import("../lib/format.ts");

test("fmtId zero-pads to 3 digits", () => {
  assert.equal(fmtId(1), "001");
  assert.equal(fmtId(42), "042");
  assert.equal(fmtId(100), "100");
});
test("fmtId leaves 3+ digit numbers unpadded", () => {
  assert.equal(fmtId(999), "999");
  assert.equal(fmtId(1234), "1234");
});
test("fmtId edge: zero", () => {
  assert.equal(fmtId(0), "000");
});

