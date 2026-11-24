import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pageDates } from "./pageDates.ts";
import { routes } from "../i18n/routes.ts";
import { jsonLd } from "../utils/jsonLd.ts";
import { maker } from "./links.ts";

test("every indexable route has dates, in both languages", () => {
  for (const route of Object.values(routes)) {
    if (!route.indexed) continue;
    for (const path of [route.en, route.pt]) {
      assert.ok(pageDates[path], `${path} is missing from pageDates`);
    }
  }
});

test("dates are ISO days and modified is not before published", () => {
  for (const [path, { published, modified }] of Object.entries(pageDates)) {
    assert.match(published, /^\d{4}-\d{2}-\d{2}$/, path);
    assert.match(modified, /^\d{4}-\d{2}-\d{2}$/, path);
    assert.ok(modified >= published, path);
  }
});

test("jsonLd cannot close the script tag", () => {
  const out = jsonLd({ v: "</script><script>alert(1)</script>" });
  assert.ok(!out.includes("<"));
  assert.deepEqual(JSON.parse(out), { v: "</script><script>alert(1)</script>" });
});

test("every cross-link carries the utm parameters", () => {
  for (const { href } of maker) {
    const url = new URL(href);
    assert.equal(url.searchParams.get("utm_source"), "hallstream", href);
    assert.equal(url.searchParams.get("utm_medium"), "website", href);
    assert.equal(url.searchParams.get("utm_campaign"), "cross-link", href);
  }
});

const load = (lang: string) =>
  JSON.parse(readFileSync(new URL(`../i18n/${lang}.json`, import.meta.url), "utf8"));
const keys = (o: any, prefix = ""): string[] =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === "object" && !Array.isArray(v) ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );

test("en.json and pt.json have the same keys", () => {
  assert.deepEqual(keys(load("pt")).sort(), keys(load("en")).sort());
});

test("no string has an em dash", () => {
  for (const lang of ["en", "pt"]) {
    assert.ok(!JSON.stringify(load(lang)).includes("—"), `${lang}.json has an em dash`);
  }
});
