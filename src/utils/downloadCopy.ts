import type { Download } from "./fallback.ts";
import { fill } from "./fill.ts";
import { formatFileSize } from "./platform.ts";

export interface DownloadStrings {
  button: string;
  follow: string;
  released: string;
  releasedShort: string;
  none: string;
  smartScreen: string;
  notWindows: string;
}

export interface DownloadCopy {
  /** The button's words. */
  label: string;
  /** False when the button links to the releases page, not a file. */
  file: boolean;
  note: string;
  /** The SmartScreen line, only once there is a file to open. */
  warning: string | null;
  /** The line a macOS or Linux visitor sees, only once there is a file. With
   * no release, the one note already says those builds are coming. */
  notWindows: string | null;
}

// With no release the button only follows the releases page, so it says so
// instead of promising a download.
export function downloadCopy(dl: Download, s: DownloadStrings, note: "long" | "short"): DownloadCopy {
  if (!dl.version || !dl.size) return { label: s.follow, file: false, note: s.none, warning: null, notWindows: null };
  const values = { version: dl.version, size: formatFileSize(dl.size) };
  return {
    label: s.button,
    file: true,
    note: fill(note === "long" ? s.released : s.releasedShort, values),
    warning: s.smartScreen,
    notWindows: s.notWindows,
  };
}
