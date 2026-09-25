import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const projectFile = (path) => new URL(`../${path}`, import.meta.url);

test("Transcribee and marketplace assets are stored locally", () => {
  const pngAssets = [
    "public/transcribee.png",
    "public/google-play-badge.png",
  ];

  for (const asset of pngAssets) {
    assert.equal(existsSync(projectFile(asset)), true, `${asset} is missing`);
    assert.deepEqual(
      [...readFileSync(projectFile(asset)).subarray(0, 8)],
      [137, 80, 78, 71, 13, 10, 26, 10],
      `${asset} is not a PNG`,
    );
  }

  const appStoreBadge = projectFile("public/app-store-badge.svg");
  assert.equal(existsSync(appStoreBadge), true, "App Store badge is missing");
  assert.match(readFileSync(appStoreBadge, "utf8"), /<svg[\s>]/);
});
