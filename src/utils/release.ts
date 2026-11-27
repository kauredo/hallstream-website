import type { ReleaseInfo } from "../types/github.ts";
import { fallbackDownload, type Download, type OtherDownload } from "./fallback.ts";
import { getRecommendedDownload } from "./platform.ts";

// The Windows file leads, since every release has it. A release with no
// Windows file (or no release at all) falls back to the releases page with
// no version or size, so the page never names a file that does not exist.
// The macOS and Linux files join it only when the release carries them, so
// a Windows-only release offers Windows alone. Every link is a file GitHub
// serves.
export function toDownload(release: ReleaseInfo | null): Download {
  if (!release) return fallbackDownload;
  const asset = getRecommendedDownload(release.platforms, "windows");
  if (!asset || !isGitHubFile(asset.url)) return fallbackDownload;
  const others: OtherDownload[] = [];
  for (const os of ["macos", "linux"] as const) {
    const other = getRecommendedDownload(release.platforms, os);
    if (other && isGitHubFile(other.url)) others.push({ os, url: other.url, size: other.size });
  }
  return { url: asset.url, version: release.version, size: asset.size, others };
}

function isGitHubFile(url: string): boolean {
  if (!URL.canParse(url)) return false;
  const { protocol, hostname } = new URL(url);
  return protocol === "https:" && (hostname === "github.com" || hostname.endsWith(".githubusercontent.com"));
}

let cached: Promise<Download> | undefined;

// Every page renders the download button, so the build asks GitHub once.
// HALLSTREAM_RELEASE_FIXTURE names a ReleaseInfo JSON file to use instead,
// so the tests can build the page with a release before one exists.
export function getDownload(): Promise<Download> {
  const fixture = process.env.HALLSTREAM_RELEASE_FIXTURE;
  cached ??= (
    fixture
      ? import("node:fs/promises").then(({ readFile }) => readFile(fixture, "utf8")).then((s): ReleaseInfo => JSON.parse(s))
      : import("./github.ts").then(({ getLatestRelease }) => getLatestRelease())
  )
    .then(toDownload)
    .catch((error) => {
      console.error(error);
      return fallbackDownload;
    });
  return cached;
}

const osNames = { macos: "macOS", linux: "Linux" } as const;

/** The JSON-LD operatingSystem: Windows, plus the systems the release has files for. */
export function operatingSystem(dl: Download): string {
  return ["Windows", ...dl.others.map((o) => osNames[o.os])].join(", ");
}
