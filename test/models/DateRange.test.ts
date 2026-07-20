import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { DateRange } from "../../src/models/DateRange";

describe("DateRange", () => {
  test("constructs a half-open range from start + numDays", () => {
    const r = new DateRange(new Date(2026, 0, 5), 3);
    assert.equal(r.start.toDateString(), new Date(2026, 0, 5).toDateString());
    assert.equal(r.end.toDateString(), new Date(2026, 0, 8).toDateString());
  });

  test("throws on non-positive numDays", () => {
    assert.throws(() => new DateRange(new Date(2026, 0, 5), 0));
    assert.throws(() => new DateRange(new Date(2026, 0, 5), -1));
  });

  test("identical ranges overlap", () => {
    const a = new DateRange(new Date(2026, 0, 5), 3);
    const b = new DateRange(new Date(2026, 0, 5), 3);
    assert.equal(a.overlaps(b), true);
  });

  test("fully-contained range overlaps the outer range", () => {
    const outer = new DateRange(new Date(2026, 0, 1), 10); // Jan 1 - Jan 11
    const inner = new DateRange(new Date(2026, 0, 5), 2);  // Jan 5 - Jan 7
    assert.equal(outer.overlaps(inner), true);
    assert.equal(inner.overlaps(outer), true); // symmetry
  });

  test("adjacent ranges (one ends when the other starts) do NOT overlap", () => {
    const first = new DateRange(new Date(2026, 0, 1), 4);  // Jan 1 - Jan 5
    const second = new DateRange(new Date(2026, 0, 5), 3); // Jan 5 - Jan 8
    assert.equal(first.overlaps(second), false);
    assert.equal(second.overlaps(first), false); // symmetry
  });

  test("completely disjoint ranges do not overlap", () => {
    const a = new DateRange(new Date(2026, 0, 1), 2);
    const b = new DateRange(new Date(2026, 1, 1), 2);
    assert.equal(a.overlaps(b), false);
  });

  test("partial overlap at the tail is detected", () => {
    const a = new DateRange(new Date(2026, 0, 1), 5); // Jan 1 - Jan 6
    const b = new DateRange(new Date(2026, 0, 5), 5); // Jan 5 - Jan 10
    assert.equal(a.overlaps(b), true);
  });
});
