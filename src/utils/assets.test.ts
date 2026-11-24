import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAssets } from "./assets.ts";

const asset = (name: string, id = 0) => ({
  id,
  name,
  browser_download_url: `https://example.test/${name}`,
  size: 1,
  download_count: 0,
  content_type: "application/octet-stream",
});

const names = [
  // What build.sh uploads today.
  "Hallstream-0.1.0.zip",
  // What later releases may add, per the roadmap.
  "Hallstream-0.2.0-macos-arm64.zip",
  "Hallstream-0.2.0.dmg",
  "hallstream_0.2.0_amd64.deb",
  "hallstream-0.2.0-1.x86_64.rpm",
  "Hallstream-0.2.0-linux-arm64.zip",
  "SHA256SUMS.txt",
  "Hallstream-0.1.0.zip.sig",
];

const parsed = parseAssets(names.map(asset));
const byName = (n: string) => parsed.find((a) => a.filename === n);

test("the build.sh zip is a Windows x64 download", () => {
  const zip = byName("Hallstream-0.1.0.zip");
  assert.deepEqual([zip?.platform, zip?.fileType, zip?.architecture], ["windows", "zip", "x64"]);
});

test("a zip that names macOS or Linux keeps that platform", () => {
  assert.equal(byName("Hallstream-0.2.0-macos-arm64.zip")?.platform, "macos");
  assert.equal(byName("Hallstream-0.2.0-macos-arm64.zip")?.architecture, "arm64");
  assert.equal(byName("Hallstream-0.2.0-linux-arm64.zip")?.platform, "linux");
});

test("the macOS DMG is an Apple Silicon build", () => {
  const dmg = byName("Hallstream-0.2.0.dmg");
  assert.deepEqual([dmg?.platform, dmg?.fileType, dmg?.architecture], ["macos", "dmg", "arm64"]);
});

test("Linux packages keep x64", () => {
  for (const [n, t] of [
    ["hallstream_0.2.0_amd64.deb", "deb"],
    ["hallstream-0.2.0-1.x86_64.rpm", "rpm"],
  ]) {
    const a = byName(n);
    assert.deepEqual([a?.platform, a?.fileType, a?.architecture], ["linux", t, "x64"]);
  }
});

test("checksums and signatures are skipped", () => {
  assert.equal(parsed.length, 6);
});
