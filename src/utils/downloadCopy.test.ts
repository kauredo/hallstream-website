import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { downloadCopy } from "./downloadCopy.ts";
import { fallbackDownload, RELEASES_URL } from "./fallback.ts";
import { fill } from "./fill.ts";

const strings = (lang: string) =>
  JSON.parse(readFileSync(new URL(`../i18n/${lang}.json`, import.meta.url), "utf8")).common.download;

const release = { url: "https://example.test/Hallstream-0.1.0.zip", version: "0.1.0", size: 12_582_912 };

for (const lang of ["en", "pt"]) {
  const s = strings(lang);

  test(`${lang}: with no release the button follows the releases page and hides the SmartScreen line`, () => {
    const c = downloadCopy(fallbackDownload, s, "long");
    assert.equal(fallbackDownload.url, RELEASES_URL);
    assert.equal(c.label, s.follow);
    assert.equal(c.file, false);
    assert.equal(c.note, s.none);
    assert.equal(c.warning, null);
  });

  test(`${lang}: with a release the button downloads, names the version and size, and explains SmartScreen`, () => {
    for (const note of ["long", "short"] as const) {
      const c = downloadCopy(release, s, note);
      assert.equal(c.label, s.button);
      assert.equal(c.file, true);
      // formatFileSize keeps one decimal, so 12 MB prints as "12.0 MB".
      assert.equal(c.note, fill(note === "long" ? s.released : s.releasedShort, { version: "0.1.0", size: "12.0 MB" }));
      assert.equal(c.warning, s.smartScreen);
    }
  });

  test(`${lang}: a version with no size gets the no-release copy`, () => {
    const c = downloadCopy({ ...release, size: null }, s, "long");
    assert.equal(c.label, s.follow);
    assert.equal(c.file, false);
    assert.equal(c.note, s.none);
    assert.equal(c.warning, null);
  });
}
