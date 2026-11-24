import { test } from "node:test";
import assert from "node:assert/strict";
import type { PlatformAsset, ReleaseInfo } from "../types/github.ts";
import { fallbackDownload } from "./fallback.ts";
import { toDownload } from "./release.ts";

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
  assert.deepEqual(toDownload(release(asset("windows", fileUrl))), { url: fileUrl, version: "0.1.0", size: 12_582_912 });
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
