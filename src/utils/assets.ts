import type { GitHubAsset, PlatformAsset } from "../types/github.ts";

function detectArchitecture(
  filename: string,
  platform: PlatformAsset["platform"],
): PlatformAsset["architecture"] {
  if (/arm64|aarch64|apple-silicon/.test(filename)) return "arm64";
  if (/x64|x86_64|amd64/.test(filename)) return "x64";
  // The app's Mac build is one app for Apple Silicon and Intel, and its
  // name says no architecture.
  return platform === "macos" ? "universal" : "x64";
}

// The app's release carries Hallstream-<version>.zip (the 64-bit and 32-bit
// Windows exes). Releases after 0.1.4 add Hallstream-<version>-macos.dmg and
// Hallstream-<version>-linux-x64.tar.gz. The zip's name says no platform, so
// a zip is Windows unless its name says mac or linux.
export function parseAssets(assets: GitHubAsset[]): PlatformAsset[] {
  const platformAssets: PlatformAsset[] = [];

  for (const asset of assets) {
    const filename = asset.name.toLowerCase();
    let platform: PlatformAsset["platform"];
    let fileType: PlatformAsset["fileType"];

    if (filename.endsWith(".exe")) {
      platform = "windows";
      fileType = "exe";
    } else if (filename.endsWith(".dmg")) {
      platform = "macos";
      fileType = "dmg";
    } else if (filename.endsWith(".deb")) {
      platform = "linux";
      fileType = "deb";
    } else if (filename.endsWith(".rpm")) {
      platform = "linux";
      fileType = "rpm";
    } else if (filename.endsWith(".tar.gz")) {
      platform = "linux";
      fileType = "tar.gz";
    } else if (filename.endsWith(".zip")) {
      fileType = "zip";
      if (/darwin|mac/.test(filename)) platform = "macos";
      else if (filename.includes("linux")) platform = "linux";
      else platform = "windows";
    } else {
      continue; // checksums, manifests and other files
    }

    platformAssets.push({
      platform,
      architecture: detectArchitecture(filename, platform),
      fileType,
      url: asset.browser_download_url,
      size: asset.size,
      filename: asset.name,
    });
  }

  return platformAssets;
}
