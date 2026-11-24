import type { ReleaseInfo } from "../types/github.ts";
import { fallbackDownload, type Download } from "./fallback.ts";
import { getRecommendedDownload } from "./platform.ts";

// Hallstream ships for Windows only, so the site offers the Windows file.
// A release with no Windows file (or no release at all) falls back to the
// releases page with no version or size, so the page never names a file
// that does not exist.
export function toDownload(release: ReleaseInfo | null): Download {
  if (!release) return fallbackDownload;
  const asset = getRecommendedDownload(release.platforms, "windows");
  if (!asset) return fallbackDownload;
  return { url: asset.url, version: release.version, size: asset.size };
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
