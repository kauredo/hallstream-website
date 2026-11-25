// Builds the site twice, once as it is today (no release of kauredo/hallstream)
// and once with test/fixtures/release.json standing in for the first release,
// then checks the HTML. Slow, so it runs only under `npm run test:build`.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { RELEASES_URL } from "../src/utils/fallback.ts";
import { formatFileSize } from "../src/utils/platform.ts";

const enabled = process.env.HALLSTREAM_BUILD_TESTS === "1";
const root = fileURLToPath(new URL("..", import.meta.url));
const fixture = join(root, "test/fixtures/release.json");
const release = JSON.parse(readFileSync(fixture, "utf8"));
const zipUrl: string = release.platforms[0].url;
const zipSize: number = release.platforms[0].size;
const strings = {
  en: JSON.parse(readFileSync(join(root, "src/i18n/en.json"), "utf8")),
  pt: JSON.parse(readFileSync(join(root, "src/i18n/pt.json"), "utf8")),
};
const homes = [
  ["en", "index.html"],
  ["pt", "pt/index.html"],
] as const;

const out = { plain: "", release: "" };

function build(dir: string, env: NodeJS.ProcessEnv) {
  execFileSync(process.execPath, [join(root, "node_modules/astro/bin/astro.mjs"), "build", "--outDir", dir], {
    cwd: root,
    env,
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  });
}

let tmp = "";
after(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
});

before(() => {
  if (!enabled) return;
  tmp = mkdtempSync(join(tmpdir(), "hallstream-build-"));
  out.plain = join(tmp, "plain");
  out.release = join(tmp, "release");
  const { HALLSTREAM_RELEASE_FIXTURE: _, ...plainEnv } = process.env;
  build(out.plain, plainEnv);
  build(out.release, { ...process.env, HALLSTREAM_RELEASE_FIXTURE: fixture });
});

// Astro escapes text and attribute values the same way.
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const count = (html: string, s: string) => html.split(s).length - 1;
const read = (dir: string, file: string) => readFileSync(join(dir, file), "utf8");

function buttons(html: string) {
  const found = [...html.matchAll(/<a class="btn[^"]*" href="([^"]*)">([\s\S]*?)<\/a>\s*<p class="dl-note">([^<]*)<\/p>/g)];
  return found.map(([, href, inner, note]) => ({ href, label: inner.replace(/<[\s\S]*?>/g, "").trim(), note }));
}

function software(html: string) {
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const data = JSON.parse(json);
    const app = (data["@graph"] ?? [data]).find((n: { "@type"?: string }) => n["@type"] === "SoftwareApplication");
    if (app) return app;
  }
  assert.fail("no SoftwareApplication JSON-LD");
}

function pages(dir: string): string[] {
  const found: string[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name === "index.html") found.push(p);
    }
  };
  walk(dir);
  return found;
}

const opts = { skip: enabled ? false : "set HALLSTREAM_BUILD_TESTS=1 (npm run test:build)" };

for (const [lang, file] of homes) {
  const s = strings[lang].common.download;

  test(`release: ${file} links the zip and names the version and size`, opts, () => {
    const html = read(out.release, file);
    const found = buttons(html);
    assert.ok(found.length > 0, "no download button");
    for (const b of found) {
      assert.equal(b.href, zipUrl);
      assert.equal(b.label, esc(s.button));
      assert.ok(b.note.includes(release.version), `note lacks the version: ${b.note}`);
      assert.ok(b.note.includes(formatFileSize(zipSize)), `note lacks the size: ${b.note}`);
    }
    assert.equal(count(html, esc(s.smartScreen)), found.length);
    assert.equal(count(html, esc(s.notWindows)), found.length);
    assert.equal(count(html, esc(s.follow)), 0);
    const app = software(html);
    assert.equal(app.softwareVersion, release.version);
    assert.equal(app.downloadUrl, zipUrl);
  });

  test(`no release: ${file} follows the releases page`, opts, (t) => {
    const html = read(out.plain, file);
    const app = software(html);
    if (app.softwareVersion) return t.skip(`the build found release ${app.softwareVersion}`);
    const found = buttons(html);
    assert.ok(found.length > 0, "no download button");
    for (const b of found) {
      assert.equal(b.href, RELEASES_URL);
      assert.equal(b.label, esc(s.follow));
      assert.equal(b.note, esc(s.none));
    }
    assert.equal(count(html, esc(s.smartScreen)), 0);
    // One note under each button: the not-Windows line waits for a release.
    assert.equal(count(html, esc(s.notWindows)), 0);
  });

  for (const build of ["plain", "release"] as const) {
    test(`${build}: ${file} has five looks in the panel's order, Cor do Clube pressed and on screen`, opts, () => {
      const html = read(out[build], file);
      assert.match(html, /<ul class="looks"[^>]*\shidden>/);
      const looks = [...html.matchAll(/<button class="look"[^>]*>/g)].map(([tag]) => tag);
      assert.equal(looks.length, 5);
      const files = looks.map((tag) => tag.match(/data-src="\/images\/onair-([^".]+)\.jpg"/)?.[1]);
      assert.deepEqual(files, ["classico", "lombada", "cor-final", "placa", "pavilhao"]);
      const pressed = looks.filter((tag) => tag.includes('aria-pressed="true"'));
      assert.equal(pressed.length, 1);
      assert.ok(pressed[0].includes('data-src="/images/onair-cor-final.jpg"'), "Cor do Clube is not the default");
      const src = pressed[0].match(/data-src="([^"]+)"/)?.[1];
      const screen = html.match(/<img id="screen"[^>]*\ssrc="([^"]+)"/)?.[1];
      assert.ok(src, "pressed look has no data-src");
      assert.equal(screen, src);
      const phone = pressed[0].match(/data-phone="([^"]+)"/)?.[1];
      assert.equal(html.match(/<source id="screen-phone"[^>]*\ssrcset="([^"]+)"/)?.[1], phone);
    });
  }
}

for (const build of ["plain", "release"] as const) {
  test(`${build}: every page has one h1, one main#main and unique ids`, opts, () => {
    for (const file of pages(out[build])) {
      const html = readFileSync(file, "utf8");
      assert.equal(count(html, "<h1"), 1, `${file}: h1 count`);
      assert.equal(count(html, "<main"), 1, `${file}: main count`);
      assert.equal(count(html, '<main id="main"'), 1, `${file}: main is not #main`);
      const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
      const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
      assert.deepEqual(dupes, [], `${file}: duplicate ids`);
    }
  });

  test(`${build}: the root 404 shows the Portuguese one under /pt/`, opts, () => {
    assert.match(read(out[build], "404.html"), /fetch\("\/pt\/404\/"\)/);
    assert.match(read(out[build], "pt/404/index.html"), /<html lang="pt-PT"/);
  });

  test(`${build}: internal links resolve`, opts, () => {
    try {
      execFileSync(process.execPath, [join(root, "scripts/check-links.mjs"), out[build]], { cwd: root, stdio: "pipe" });
    } catch (error: any) {
      assert.fail(String(error.stdout));
    }
  });
}
