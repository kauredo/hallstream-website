export interface GitHubAsset {
  id: number;
  name: string; // e.g. "Hallstream-0.1.0.zip"
  browser_download_url: string;
  size: number; // bytes
  download_count: number;
  content_type: string;
}

export interface PlatformAsset {
  platform: "windows" | "macos" | "linux";
  architecture: "x64" | "arm64" | "universal";
  fileType: "exe" | "dmg" | "deb" | "rpm" | "zip" | "tar.gz";
  url: string;
  size: number;
  filename: string;
}

export interface ReleaseInfo {
  version: string;
  releaseDate: Date;
  releaseNotes: string;
  platforms: PlatformAsset[];
  isPrerelease: boolean;
  downloadCount: number;
}

export type Platform = "windows" | "macos" | "linux" | "unknown";
export type Architecture = "x64" | "arm64" | "unknown";
