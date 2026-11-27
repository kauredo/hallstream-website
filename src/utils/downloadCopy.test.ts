import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { downloadCopy } from "./downloadCopy.ts";
import { fallbackDownload, RELEASES_URL } from "./fallback.ts";
import { fill } from "./fill.ts";

const strings = (lang: string) =>
  JSON.parse(readFileSync(new URL(`../i18n/${lang}.json`, import.meta.url), "utf8")).common.download;

const release = { url: "https://example.test/Hallstream-0.1.0.zip", version: "0.1.0", size: 12_582_912, others: [] };
const withOthers = {
  ...release,
  others: [
    { os: "macos" as const, url: "https://example.test/Hallstream-0.1.0-macos.dmg", size: 15_728_640 },
    { os: "linux" as const, url: "https://example.test/Hallstream-0.1.0-linux-x64.tar.gz", size: 10_485_760 },
  ],
};

for (const lang of ["en", "pt"]) {
  const s = strings(lang);

  test(`${lang}: with no release the button follows the releases page under one note`, () => {
    const c = downloadCopy(fallbackDownload, s, "long");
    assert.equal(fallbackDownload.url, RELEASES_URL);
    assert.equal(c.label, s.follow);
    assert.equal(c.file, false);
    assert.equal(c.note, s.none);
    assert.equal(c.warning, null);
    assert.equal(c.notWindows, null);
  });

  test(`${lang}: the no-release note names the three systems`, () => {
    assert.match(s.none, /Windows/);
    assert.match(s.none, /Mac/);
    assert.match(s.none, /Linux/);
  });

  test(`${lang}: with a release the button downloads, names the version and size, and explains SmartScreen`, () => {
    for (const note of ["long", "short"] as const) {
      const c = downloadCopy(release, s, note);
      assert.equal(c.label, s.button);
      assert.equal(c.file, true);
      // formatFileSize keeps one decimal, so 12 MB prints as "12.0 MB".
      assert.equal(c.note, fill(note === "long" ? s.released : s.releasedShort, { version: "0.1.0", size: "12.0 MB" }));
      assert.equal(c.warning, s.smartScreen);
      assert.equal(c.notWindows, s.notWindows);
    }
  });

  test(`${lang}: a Windows-only release offers no other system and keeps the not-Windows line`, () => {
    const c = downloadCopy(release, s, "long");
    assert.deepEqual(c.others, []);
    assert.equal(c.later, null);
    assert.equal(c.notWindows, s.notWindows);
  });

  test(`${lang}: macOS and Linux files get their own button, size, needs and the later line`, () => {
    const c = downloadCopy(withOthers, s, "short");
    assert.equal(c.notWindows, null);
    assert.equal(c.later, s.later);
    assert.deepEqual(c.others, [
      {
        os: "macos",
        url: withOthers.others[0].url,
        button: s.macos.button,
        label: s.macos.label,
        note: fill(s.releasedShort, { version: "0.1.0", size: "15.0 MB" }),
        needs: s.macos.needs,
      },
      {
        os: "linux",
        url: withOthers.others[1].url,
        button: s.linux.button,
        label: s.linux.label,
        note: fill(s.releasedShort, { version: "0.1.0", size: "10.0 MB" }),
        needs: s.linux.needs,
      },
    ]);
  });

  test(`${lang}: the Mac needs line names macOS 13 and both chips`, () => {
    assert.match(s.macos.needs, /macOS 13/);
    assert.match(s.macos.needs, /Apple Silicon/);
    assert.match(s.macos.needs, /Intel/);
  });

  test(`${lang}: a version with no size gets the no-release copy`, () => {
    const c = downloadCopy({ ...release, size: null }, s, "long");
    assert.equal(c.label, s.follow);
    assert.equal(c.file, false);
    assert.equal(c.note, s.none);
    assert.equal(c.warning, null);
    assert.equal(c.notWindows, null);
  });
}
