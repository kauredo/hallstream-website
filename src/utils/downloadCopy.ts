import type { Download, OtherDownload } from "./fallback.ts";
import { fill } from "./fill.ts";
import { formatFileSize } from "./platform.ts";

interface OsStrings {
  /** The big button: "Download for Mac". */
  button: string;
  /** The short name in the list of other systems. */
  label: string;
  /** What the file needs and how to start it. */
  needs: string;
}

export interface DownloadStrings {
  button: string;
  follow: string;
  released: string;
  releasedShort: string;
  none: string;
  smartScreen: string;
  notWindows: string;
  windows: string;
  other: string;
  later: string;
  macos: OsStrings;
  linux: OsStrings;
}

export interface OtherCopy {
  os: OtherDownload["os"];
  url: string;
  button: string;
  label: string;
  note: string;
  needs: string;
}

export interface DownloadCopy {
  /** The button's words. */
  label: string;
  /** False when the button links to the releases page, not a file. */
  file: boolean;
  note: string;
  /** The SmartScreen line, only once there is a file to open. */
  warning: string | null;
  /** The line a macOS or Linux visitor sees once there is a Windows file but
   * no file for their system. With no release, the one note already says
   * those builds are coming. */
  notWindows: string | null;
  /** One entry per macOS or Linux file in the release. */
  others: OtherCopy[];
  /** The list label and the Windows name, for when another system leads. */
  other: string;
  windows: string;
  /** What macOS and Linux lack so far, only when one of them has a file. */
  later: string | null;
}

// With no release the button only follows the releases page, so it says so
// instead of promising a download.
export function downloadCopy(dl: Download, s: DownloadStrings, note: "long" | "short"): DownloadCopy {
  const base = { other: s.other, windows: s.windows };
  if (!dl.version || !dl.size) {
    return { ...base, label: s.follow, file: false, note: s.none, warning: null, notWindows: null, others: [], later: null };
  }
  const version = dl.version;
  const released = (size: number) =>
    fill(note === "long" ? s.released : s.releasedShort, { version, size: formatFileSize(size) });
  const others = dl.others.map(({ os, url, size }) => ({
    os,
    url,
    button: s[os].button,
    label: s[os].label,
    note: released(size),
    needs: s[os].needs,
  }));
  return {
    ...base,
    label: s.button,
    file: true,
    note: released(dl.size),
    warning: s.smartScreen,
    notWindows: others.length ? null : s.notWindows,
    others,
    later: others.length ? s.later : null,
  };
}
