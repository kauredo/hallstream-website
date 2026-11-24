import type { ReleaseInfo } from "../types/github.ts";
import { fallbackDownload, type Download } from "./fallback.ts";
import { getRecommendedDownload } from "./platform.ts";

// Hallstream ships for Windows only, so the site offers the Windows file.
// A release with no Windows file (or no release at all) falls back to the
// releases page with no version or size, so the page never names a file
// that does not exist. The button only ever links a file GitHub serves.
export function toDownload(release: ReleaseInfo | null): Download {
  if (!release) return fallbackDownload;
  const asset = getRecommendedDownload(release.platforms, "windows");
  if (!asset || !isGitHubFile(asset.url)) return fallbackDownload;
  return { url: asset.url, version: release.version, size: asset.size };
}

function isGitHubFile(url: string): boolean {
  if (!URL.canParse(url)) return false;
  const { protocol, hostname } = new URL(url);
  return protocol === "https:" && (hostname === "github.com" || hostname.endsWith(".githubusercontent.com"));
}

let cached: Promise<Download> | undefined;

// Every page renders the download button, so the build asks GitHub once.
export function getDownload(): Promise<Download> {
  cached ??= import("./github.ts")
    .then(({ getLatestRelease }) => getLatestRelease())
    .then(toDownload)
    .catch((error) => {
      console.error(error);
      return fallbackDownload;
    });
  return cached;
}
