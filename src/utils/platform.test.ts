import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAssets } from "./assets.ts";
import { formatFileSize, getRecommendedDownload } from "./platform.ts";
import { toDownload } from "./release.ts";
import { RELEASES_URL } from "./fallback.ts";

const release = (names: string[]) =>
  parseAssets(
    names.map((name, id) => ({
      id,
      name,
      browser_download_url: `https://github.com/kauredo/hallstream/releases/download/v0.1.0/${name}`,
      size: 12_582_912,
      download_count: 0,
      content_type: "application/octet-stream",
    })),
  );

const info = (names: string[]) => ({
  version: "0.1.0",
  releaseDate: new Date("2026-12-01"),
  releaseNotes: "",
  platforms: release(names),
  isPrerelease: false,
  downloadCount: 0,
});

test("Windows gets the build.sh zip", () => {
  assert.equal(
    getRecommendedDownload(release(["Hallstream-0.1.0.zip"]), "windows")?.filename,
    "Hallstream-0.1.0.zip",
  );
});

test("Windows gets an exe over a zip when both ship", () => {
  const both = release(["Hallstream-0.3.0.zip", "Hallstream-0.3.0-Setup.exe"]);
  assert.equal(getRecommendedDownload(both, "windows")?.fileType, "exe");
});

test("a Mac gets the Apple Silicon DMG", () => {
  const mac = release(["Hallstream-0.2.0-x64.dmg", "Hallstream-0.2.0.dmg", "Hallstream-0.2.0-macos-arm64.zip"]);
  assert.equal(getRecommendedDownload(mac, "macos")?.filename, "Hallstream-0.2.0.dmg");
});

const withUserAgent = (ua: string, run: () => void) => {
  (globalThis as any).window = { navigator: { userAgent: ua, platform: "Linux" } };
  try {
    run();
  } finally {
    delete (globalThis as any).window;
  }
};

test("Linux picks the package for its own architecture", () => {
  const linux = release(["hallstream_0.2.0_arm64.deb", "hallstream_0.2.0_amd64.deb"]);
  withUserAgent("Mozilla/5.0 (X11; Linux x86_64)", () =>
    assert.equal(getRecommendedDownload(linux, "linux")?.architecture, "x64"),
  );
  withUserAgent("Mozilla/5.0 (X11; Linux aarch64)", () =>
    assert.equal(getRecommendedDownload(linux, "linux")?.architecture, "arm64"),
  );
});

test("no release falls back to the releases page with no version or size", () => {
  assert.deepEqual(toDownload(null), { url: RELEASES_URL, version: null, size: null });
});

test("a release with no Windows file falls back too", () => {
  assert.equal(toDownload(info(["Hallstream-0.2.0.dmg"])).version, null);
});

test("a release with the zip names its version, size and file", () => {
  assert.deepEqual(toDownload(info(["Hallstream-0.1.0.zip"])), {
    url: "https://github.com/kauredo/hallstream/releases/download/v0.1.0/Hallstream-0.1.0.zip",
    version: "0.1.0",
    size: 12_582_912,
  });
  assert.equal(formatFileSize(12_582_912), "12.0 MB");
});
