import type { Platform, Architecture, PlatformAsset } from "../types/github.ts";

export function detectPlatform(): Platform {
  if (typeof window === "undefined") return "unknown";

  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = (window.navigator.platform || "").toLowerCase();

  if (platform.includes("mac") || userAgent.includes("mac os")) return "macos";
  if (platform.includes("win") || userAgent.includes("windows")) return "windows";
  if (platform.includes("linux") || userAgent.includes("linux")) return "linux";
  return "unknown";
}

export function getArchitecture(): Architecture {
  if (typeof window === "undefined") return "unknown";
  const userAgent = window.navigator.userAgent.toLowerCase();
  // Arm Linux browsers say so ("Linux aarch64"); Mac browsers never do.
  if (userAgent.includes("aarch64") || userAgent.includes("arm64")) return "arm64";
  return "x64";
}

export function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(1);
  return `${size} ${sizes[i]}`;
}

export function getRecommendedDownload(
  platformAssets: PlatformAsset[],
  userPlatform: Platform,
): PlatformAsset | null {
  // Every Mac browser reports "Intel Mac OS X", Apple Silicon included, so
  // a Mac is offered the universal build, then the Apple Silicon one. The
  // build runs with no browser, so elsewhere x64 comes after the visitor's
  // own architecture.
  const prefs = userPlatform === "macos" ? ["universal", "arm64"] : [getArchitecture(), "x64"];

  const forUser = platformAssets.filter((asset) => asset.platform === userPlatform);
  const installers = forUser.filter((asset) => asset.fileType === "dmg");
  const options = (userPlatform === "macos" && installers.length > 0 ? installers : forUser).sort(
    (a, b) => Number(a.fileType === "zip") - Number(b.fileType === "zip"),
  );

  for (const arch of prefs) {
    const match = options.find((asset) => asset.architecture === arch);
    if (match) return match;
  }
  return options[0] ?? null;
}
