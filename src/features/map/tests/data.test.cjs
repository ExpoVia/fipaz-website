/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node runner with a TypeScript require hook. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

// Load the data's TypeScript using the project's compiler, without adding a test runtime.
require.extensions[".ts"] = (module, filename) => {
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  module._compile(compiled.outputText, filename);
};
const { mapPlans, expoStands, routeDefinitions, pois } = require("../data/expoMapData.ts");

const expected = {
  "red-lower": [1, 49, ["R1", "R2"]], "red-upper": [50, 110, []],
  "yellow-lower": [1, 86, ["A1", "A2", "A3", "A4", "A5", "A6"]],
  "yellow-upper": [87, 205, ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P14", "P14-A", "P14-B", "A8"]],
  "green-upper": [1, 101, []], "entrance": [1, 5, ["E1", "E2"]],
  "food-court": [0, -1, Array.from({ length: 29 }, (_, i) => `G-${i + 1}`)],
};
test("Each source plan has its complete numbering and unique IDs", () => {
  assert.equal(new Set(expoStands.map((stand) => stand.id)).size, expoStands.length);
  for (const plan of mapPlans) {
    const [start, end, special] = expected[plan.id];
    // These numbers are absent in the supplied images; do not invent their positions.
    const missing = plan.id === "yellow-lower" ? ["46", "47"] : plan.id === "yellow-upper" ? ["142"] : [];
    const codes = [...Array.from({ length: end - start + 1 }, (_, i) => String(i + start)), ...special].filter((code) => !missing.includes(code));
    const actual = expoStands.filter((stand) => stand.planId === plan.id).map((stand) => stand.code);
    assert.deepEqual(actual.sort(), codes.sort(), plan.id);
  }
});
test("Stand rectangles stay inside their viewport and do not overlap", () => {
  const collisions = [];
  for (const plan of mapPlans) {
    const [x, y, w, h] = plan.viewBox.split(" ").map(Number);
    const stands = expoStands.filter((stand) => stand.planId === plan.id);
    for (const stand of stands) {
      assert.ok(stand.x >= x && stand.y >= y && stand.x + stand.width <= x + w && stand.y + stand.height <= y + h, stand.id);
      assert.ok(stand.width > 0 && stand.height > 0, stand.id);
      for (const other of stands) {
        if (stand.id >= other.id) continue;
        const overlapX = Math.min(stand.x + stand.width, other.x + other.width) - Math.max(stand.x, other.x);
        const overlapY = Math.min(stand.y + stand.height, other.y + other.height) - Math.max(stand.y, other.y);
        if (overlapX >= 1 && overlapY >= 1) collisions.push(`${stand.id} overlaps ${other.id}: ${overlapX}x${overlapY}`);
      }
    }
  }
  assert.deepEqual(collisions, []);
});
test("Routes start at a free simulated origin and end on the intended stand", () => {
  for (const route of routeDefinitions) {
    const plan = mapPlans.find((plan) => plan.id === route.planId);
    const stand = expoStands.find((stand) => stand.id === route.standId);
    assert.equal(stand.planId, plan.id);
    const points = route.points.split(" ").map((point) => point.split(",").map(Number));
    assert.deepEqual(points[0], [plan.origin.x, plan.origin.y]);
    const [x, y] = points.at(-1);
    assert.ok(x >= stand.x && x <= stand.x + stand.width && y >= stand.y && y <= stand.y + stand.height, route.standId);
  }
  for (const plan of mapPlans) {
    for (const stand of expoStands.filter((stand) => stand.planId === plan.id)) {
      assert.ok(!(plan.origin.x > stand.x && plan.origin.x < stand.x + stand.width && plan.origin.y > stand.y && plan.origin.y < stand.y + stand.height), `${plan.id} origin inside ${stand.id}`);
    }
  }
});
test("POIs have a known plan; only explicit demo exhibitors have a category", () => {
  for (const poi of pois) assert.ok(mapPlans.some((plan) => plan.id === poi.planId));
  // Twelve original map examples plus the three shared FIPAZ demo exhibitors.
  assert.equal(expoStands.filter((stand) => stand.demo).length, 15);
  for (const stand of expoStands) assert.equal(stand.category !== "unassigned", stand.demo);
});
