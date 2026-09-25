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

const html = readFileSync(projectFile("index.html"), "utf8");
const normalizedHtml = html.replace(/\s+/g, " ");
const googlePlayUrl =
  "https://play.google.com/store/apps/details?id=com.cyfertek.aitranscribe";
const appStoreUrl =
  "https://apps.apple.com/gb/app/transcribee-speech-to-text/id6752488311";

const linkFor = (href) => {
  const escapedHref = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    html.match(new RegExp(`<a[^>]*href="${escapedHref}"[^>]*>[\\s\\S]*?<\\/a>`))?.[0] ??
    ""
  );
};

test("Our Apps appears between the introduction and Services", () => {
  const introductionPosition = html.indexOf('class="home-description2"');
  const appsPosition = html.indexOf('class="home-apps"');
  const servicesPosition = html.indexOf('class="home-services"');

  assert.ok(introductionPosition >= 0, "Introduction is missing");
  assert.ok(appsPosition > introductionPosition, "Our Apps must follow the introduction");
  assert.ok(servicesPosition > appsPosition, "Our Apps must precede Services");
  assert.match(html, /<section class="home-apps" aria-labelledby="our-apps-title">/);
  assert.match(html, /<article class="home-app-card">/);
});

test("the page requests the current version of the home-page stylesheet", () => {
  assert.match(html, /<link href="\.\/index\.css\?v=83112c5d" rel="stylesheet" \/>/);
});

test("Transcribee uses the approved copy and feature highlights", () => {
  const requiredCopy = [
    "OUR APPS",
    "Transcribee",
    "AI transcription that keeps up with you.",
    "Turn audio and video into accurate transcripts and useful summaries in more than 90 languages.",
    "AI transcripts &amp; summaries",
    "90+ languages",
    "Live transcription &amp; translation",
    "60 free minutes",
  ];

  for (const copy of requiredCopy) {
    assert.ok(normalizedHtml.includes(copy), `Missing copy: ${copy}`);
  }

  assert.ok(!html.includes("More apps coming soon"));
  assert.match(html, /src="public\/transcribee\.png"\s+alt="Transcribee logo"/);
});

test("Marketplace links are external, safe, and accessible", () => {
  const googleLink = linkFor(googlePlayUrl);
  const appleLink = linkFor(appStoreUrl);

  for (const [name, link] of [
    ["Google Play", googleLink],
    ["App Store", appleLink],
  ]) {
    assert.notEqual(link, "", `${name} link is missing`);
    assert.match(link, /target="_blank"/);
    assert.match(link, /rel="noopener noreferrer"/);
    assert.match(link, new RegExp(`aria-label="[^"]*${name}[^"]*"`));
  }

  assert.match(googleLink, /src="public\/google-play-badge\.png"/);
  assert.match(appleLink, /src="public\/app-store-badge\.svg"/);
});

const css = readFileSync(projectFile("index.css"), "utf8");

test("Our Apps has desktop, responsive, and focus styles", () => {
  const requiredSelectors = [
    ".home-apps {",
    ".home-apps-header {",
    ".home-apps-grid {",
    ".home-app-card {",
    ".home-app-artwork {",
    ".home-app-image {",
    ".home-app-details {",
    ".home-app-features {",
    ".home-app-links {",
    ".home-store-link:focus-visible {",
    ".home-store-badge {",
  ];

  for (const selector of requiredSelectors) {
    assert.ok(css.includes(selector), `Missing CSS selector: ${selector}`);
  }

  assert.match(css, /@media\(max-width: 991px\)[\s\S]*\.home-app-card \{[\s\S]*?grid-template-columns: 1fr;/);
  assert.match(css, /@media\(max-width: 767px\)[\s\S]*\.home-app-features \{[\s\S]*?grid-template-columns: 1fr;/);
  assert.match(css, /@media\(max-width: 479px\)[\s\S]*\.home-app-links \{[\s\S]*?flex-direction: column;/);
});
