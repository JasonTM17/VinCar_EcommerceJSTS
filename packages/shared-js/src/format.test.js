import test from "node:test";
import assert from "node:assert/strict";
import { formatVND, slugify } from "./format.js";

test("formatVND groups thousands", () => {
  assert.equal(formatVND(0n), "0 ₫");
  assert.match(formatVND(1000000n), /^1/);
});

test("slugify normalizes Vietnamese text", () => {
  assert.equal(slugify("Xe Điện AutoNova V8"), "xe-dien-autonova-v8");
});
