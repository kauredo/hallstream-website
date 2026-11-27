// What the download button shows when the build cannot read a release.
// Hallstream has no published release yet, so the fallback is that state
// and nothing else: no version, no size, and the releases page as the link.
// Once a release exists, the build reads it and this only covers a failed
// GitHub request.
export const RELEASES_URL = "https://github.com/kauredo/hallstream/releases";

/** A macOS or Linux file in the same release as the Windows one. */
export interface OtherDownload {
  os: "macos" | "linux";
  url: string;
  /** Bytes. */
  size: number;
}

export interface Download {
  /** The Windows file, or the releases page with no release. */
  url: string;
  /** null when there is no release to name. */
  version: string | null;
  /** Bytes, or null with no release. */
  size: number | null;
  /** The macOS and Linux files the release carries, in that order. Empty
   * until a release has them, so the page offers only what exists. */
  others: OtherDownload[];
}

export const fallbackDownload: Download = {
  url: RELEASES_URL,
  version: null,
  size: null,
  others: [],
};
