import { Octokit } from "@octokit/rest";
import type { ReleaseInfo } from "../types/github.ts";
import { parseAssets } from "./assets.ts";

export const REPO_OWNER = "kauredo";
export const REPO_NAME = "hallstream";

export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public rateLimitReset?: Date,
  ) {
    super(message);
    this.name = "GitHubAPIError";
  }
}

// Read once per build. A 404 means the repo has no published release yet,
// which is the normal state before the first one: the caller falls back.
export async function getLatestRelease(): Promise<ReleaseInfo | null> {
  // The request log is off: a 404 before the first release is expected, and
  // the catch below reports anything else.
  const quiet = () => {};
  const octokit = new Octokit({
    auth: import.meta.env?.GITHUB_TOKEN,
    log: { debug: quiet, info: quiet, warn: console.warn, error: quiet },
  });
  try {
    const { data: release } = await octokit.rest.repos.getLatestRelease({
      owner: REPO_OWNER,
      repo: REPO_NAME,
    });

    return {
      version: release.tag_name.replace(/^v/, ""),
      releaseDate: new Date(release.published_at ?? 0),
      releaseNotes: release.body || "",
      platforms: parseAssets(release.assets),
      isPrerelease: release.prerelease,
      downloadCount: release.assets.reduce((sum, asset) => sum + asset.download_count, 0),
    };
  } catch (error: any) {
    if (error.status === 404) return null;

    if (error.status === 403 && error.response?.headers?.["x-ratelimit-remaining"] === "0") {
      const resetTime = new Date(parseInt(error.response.headers["x-ratelimit-reset"]) * 1000);
      throw new GitHubAPIError("GitHub API rate limit exceeded", 403, resetTime);
    }

    console.error("Failed to fetch latest release:", error);
    return null;
  }
}
