import { test } from "node:test";
import assert from "node:assert/strict";
import type { PlatformAsset, ReleaseInfo } from "../types/github.ts";
import { fallbackDownload } from "./fallback.ts";
import { operatingSystem, toDownload } from "./release.ts";

const asset = (platform: PlatformAsset["platform"], url: string): PlatformAsset => ({
  platform,
  architecture: "x64",
  fileType: "zip",
  url,
  size: 12_582_912,
  filename: "Hallstream-0.1.0.zip",
});

const release = (...platforms: PlatformAsset[]): ReleaseInfo => ({
  version: "0.1.0",
  releaseDate: new Date("2026-11-01T00:00:00Z"),
  releaseNotes: "",
  platforms,
  isPrerelease: false,
  downloadCount: 0,
});

const fileUrl = "https://github.com/kauredo/hallstream/releases/download/v0.1.0/Hallstream-0.1.0.zip";

test("with no release the download is the fallback", () => {
  assert.deepEqual(toDownload(null), fallbackDownload);
});

test("a release with no Windows file falls back", () => {
  assert.deepEqual(toDownload(release(asset("macos", fileUrl))), fallbackDownload);
});

test("a release with a Windows file links it with its version and size", () => {
  assert.deepEqual(toDownload(release(asset("windows", fileUrl))), {
    url: fileUrl,
    version: "0.1.0",
    size: 12_582_912,
    others: [],
  });
});

const dmgUrl = "https://github.com/kauredo/hallstream/releases/download/v0.2.0/Hallstream-0.2.0-macos.dmg";
const tarUrl = "https://github.com/kauredo/hallstream/releases/download/v0.2.0/Hallstream-0.2.0-linux-x64.tar.gz";

test("macOS and Linux files join the Windows one, macOS first", () => {
  const dl = toDownload(release(asset("linux", tarUrl), asset("windows", fileUrl), asset("macos", dmgUrl)));
  assert.equal(dl.url, fileUrl);
  assert.deepEqual(dl.others, [
    { os: "macos", url: dmgUrl, size: 12_582_912 },
    { os: "linux", url: tarUrl, size: 12_582_912 },
  ]);
});

test("a macOS or Linux file off GitHub is left out", () => {
  const dl = toDownload(release(asset("windows", fileUrl), asset("macos", "https://example.com/Hallstream.dmg")));
  assert.deepEqual(dl.others, []);
});

test("operatingSystem names only the systems with a file", () => {
  assert.equal(operatingSystem(toDownload(null)), "Windows");
  assert.equal(operatingSystem(toDownload(release(asset("windows", fileUrl)))), "Windows");
  assert.equal(
    operatingSystem(toDownload(release(asset("windows", fileUrl), asset("macos", dmgUrl), asset("linux", tarUrl)))),
    "Windows, macOS, Linux",
  );
});

test("a GitHub user-content host is accepted", () => {
  const url = "https://objects.githubusercontent.com/hallstream/Hallstream-0.1.0.zip";
  assert.equal(toDownload(release(asset("windows", url))).url, url);
});

for (const url of [
  "http://github.com/kauredo/hallstream/releases/download/v0.1.0/Hallstream-0.1.0.zip",
  "https://example.com/Hallstream-0.1.0.zip",
  "https://github.com.example.com/Hallstream-0.1.0.zip",
  "not a url",
]) {
  test(`a Windows file at ${url} falls back`, () => {
    assert.deepEqual(toDownload(release(asset("windows", url))), fallbackDownload);
  });
}
