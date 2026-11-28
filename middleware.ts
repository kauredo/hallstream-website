// Vercel Routing Middleware. It counts each real page load for the owner's
// analytics hub, server side, with no cookie and nothing about the visitor:
// the hub stores the page path per day and, for a visit from an AI
// assistant, that assistant's host. The privacy page says so. Copied from
// KidShare's middleware.ts.
import { next } from "@vercel/functions";

export const config = {
  // Pages only: skip build assets, fonts, images, Vercel's own scripts and
  // any path with a file extension.
  matcher: "/((?!_astro|_vercel|fonts|images|.*\\..*).*)",
};

type RequestContext = { waitUntil: (promise: Promise<unknown>) => void };

// Known AI-assistant referer hosts. Mirrors analytics-hub
// convex/lib/aiSources.ts; keep in sync.
const AI_REFERER_RE =
  /(^|\.)(chatgpt|openai|perplexity|copilot|claude\.ai|gemini\.google|bard\.google|you|grok|x\.ai|deepseek|mistral)(\.|$)/i;

// Crawlers and monitors, so the count is people.
const BOT_UA_RE =
  /bot|crawl|spider|slurp|gptbot|claudebot|ccbot|facebookexternalhit|embedly|preview|lighthouse|headless|monitor|pingdom|uptime/i;

// Vulnerability-scanner probes. Mirrors analytics-hub convex/lib/pagePaths.ts;
// keep in sync.
const SCANNER_PREFIXES = ["/wp-admin", "/wp-content", "/wp-includes", "/wp-json", "/wp-login", "/xmlrpc", "/wp/"];

function isRealPagePath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  const p = path.toLowerCase();
  if (p.startsWith("/.") || p.startsWith("/__")) return false;
  if (SCANNER_PREFIXES.some((prefix) => p.startsWith(prefix))) return false;
  const last = p.split("?")[0].replace(/\/+$/, "").split("/").pop() ?? "";
  return !last.includes(".");
}

function firePageBeacon(request: Request, context: RequestContext) {
  const url = process.env.PAGE_BEACON_URL;
  const secret = process.env.AI_BEACON_SECRET;
  if (!url || !secret) return;
  if (request.method !== "GET") return;
  if (BOT_UA_RE.test(request.headers.get("user-agent") ?? "")) return;
  const u = new URL(request.url);
  if (!isRealPagePath(u.pathname)) return;
  let referer: string | undefined;
  const ref = request.headers.get("referer");
  if (ref) {
    try {
      const host = new URL(ref).hostname;
      if (host !== u.hostname && AI_REFERER_RE.test(host)) referer = host;
    } catch {
      // An unreadable Referer counts as no referer.
    }
  }
  context.waitUntil(
    fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-beacon-secret": secret },
      body: JSON.stringify({ domain: u.hostname, path: u.pathname, referer }),
    }).catch(() => {}),
  );
}

export default function middleware(request: Request, context: RequestContext) {
  firePageBeacon(request, context);
  return next();
}
