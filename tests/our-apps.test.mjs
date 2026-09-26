import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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
const transcribeeUrl = "https://transcribee.app";
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
  const currentCss = readFileSync(projectFile("index.css"));
  const cssVersion = createHash("sha256").update(currentCss).digest("hex").slice(0, 8);

  assert.match(
    html,
    new RegExp(`<link href="\\.\\/index\\.css\\?v=${cssVersion}" rel="stylesheet" \\/>`),
  );
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

test("Transcribee artwork and Learn more link to its website", () => {
  const escapedUrl = transcribeeUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const landingLinks = [
    ...html.matchAll(new RegExp(`<a[^>]*href="${escapedUrl}"[^>]*>[\\s\\S]*?<\\/a>`, "g")),
  ].map(([link]) => link);

  assert.equal(landingLinks.length, 2, "Expected exactly two Transcribee website links");

  const artworkLink = landingLinks.find((link) =>
    link.includes('class="home-app-artwork-link"'),
  );
  const learnMoreLink = landingLinks.find((link) =>
    link.includes('class="home-app-learn-more"'),
  );

  assert.notEqual(artworkLink, undefined, "Transcribee artwork link is missing");
  assert.notEqual(learnMoreLink, undefined, "Transcribee Learn more link is missing");

  for (const link of landingLinks) {
    assert.match(link, /target="_blank"/);
    assert.match(link, /rel="noopener noreferrer"/);
  }

  assert.match(artworkLink, /aria-label="Visit the Transcribee website"/);
  assert.match(artworkLink, /src="public\/transcribee\.png"/);
  assert.match(learnMoreLink, />\s*Learn more\s*<\/a>/);
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

const ruleBody = (selector, startAt = 0, endAt = css.length) => {
  const selectorPosition = css.indexOf(selector, startAt);
  assert.ok(
    selectorPosition >= 0 && selectorPosition < endAt,
    `Missing CSS selector in range: ${selector}`,
  );

  const bodyStart = css.indexOf("{", selectorPosition) + 1;
  return css.slice(bodyStart, css.indexOf("}", bodyStart));
};

const assertDeclarations = (selector, declarations, startAt = 0, endAt = css.length) => {
  const body = ruleBody(selector, startAt, endAt);

  for (const declaration of declarations) {
    assert.ok(body.includes(declaration), `${selector} is missing ${declaration}`);
  }
};

const blockEnd = (startAt) => {
  const bodyStart = css.indexOf("{", startAt);
  assert.ok(bodyStart >= 0, `Missing CSS block at offset ${startAt}`);

  let depth = 1;
  for (let position = bodyStart + 1; position < css.length; position += 1) {
    if (css[position] === "{") depth += 1;
    if (css[position] === "}") depth -= 1;
    if (depth === 0) return position;
  }

  assert.fail(`Unclosed CSS block at offset ${startAt}`);
};

const assertBlockDeclarations = (selector, declarations, blockStart) => {
  assertDeclarations(selector, declarations, blockStart, blockEnd(blockStart));
};

test("CSS declaration checks stay within the requested range", () => {
  const tablet = css.indexOf("@media(max-width: 991px)", css.indexOf(".home-container"));
  const mobile = css.indexOf("@media(max-width: 767px)");

  assert.throws(
    () => ruleBody(".home-app-features {", tablet, mobile),
    /Missing CSS selector in range/,
  );
});

test("desktop homepage uses the approved compact scale", () => {
  assertDeclarations(".service-service {", [
    "gap: var(--dl-space-space-oneandhalfunits);",
    "padding-bottom: var(--dl-space-space-twounits);",
  ]);
  assertDeclarations(".service-title {", ["font-size: 30px;", "line-height: 30px;"]);
  assertDeclarations(".service-description {", ["font-size: 16px;", "line-height: 28px;"]);
  assertDeclarations(".service-service1 {", [
    "gap: var(--dl-space-space-oneandhalfunits);",
    "padding-bottom: var(--dl-space-space-twounits);",
  ]);
  assertDeclarations(".service-title1 {", ["font-size: 30px;", "line-height: 30px;"]);
  assertDeclarations(".service-description1 {", ["font-size: 16px;", "line-height: 28px;"]);
  assertDeclarations(".home-navbar-interactive {", ["padding-top: 20px;"]);
  assertDeclarations(".home-header2 {", ["padding-top: 64px;", "padding-bottom: 96px;"]);
  assertDeclarations(".home-title1 {", ["font-size: 88px;", "line-height: 82px;"]);
  assertDeclarations(".home-description1 {", ["font-size: 20px;", "line-height: 30px;"]);
  assertDeclarations(".home-description2 {", [
    "margin-top: var(--dl-space-space-threeunits);",
    "padding-top: var(--dl-space-space-threeunits);",
    "padding-bottom: 72px;",
  ]);
  assertDeclarations(".home-text8 {", ["font-size: 24px;", "line-height: 36px;"]);
  assertDeclarations(".home-apps {", [
    "gap: var(--dl-space-space-threeunits);",
    "padding-top: 72px;",
    "padding-bottom: 72px;",
  ]);
  assertDeclarations(".home-apps-header {", ["padding-bottom: var(--dl-space-space-twounits);"]);
  assertDeclarations(".home-apps .heading,", ["font-size: 56px;", "line-height: 52px;"]);
  assertDeclarations(".home-app-artwork {", [
    "min-height: 380px;",
    "padding: var(--dl-space-space-twounits);",
  ]);
  assertDeclarations(".home-app-details {", ["gap: 24px;", "padding: 40px;"]);
  assertDeclarations(".home-app-name {", ["font-size: 30px;", "line-height: 30px;"]);
  assertDeclarations(".home-app-lead {", ["font-size: 24px;", "line-height: 32px;"]);
  assertDeclarations(".home-app-description {", ["font-size: 16px;", "line-height: 26px;"]);
  assertDeclarations(".home-app-feature {", ["font-size: 14px;", "line-height: 21px;"]);
  assertDeclarations(".home-store-badge {", ["height: 46px;"]);
  assertDeclarations(".home-services {", [
    "gap: var(--dl-space-space-threeunits);",
    "padding-top: 72px;",
    "padding-bottom: 72px;",
  ]);
  assertDeclarations(".home-header3 {", ["padding-bottom: var(--dl-space-space-twounits);"]);
  assertDeclarations(".home-information {", [
    "padding-top: var(--dl-space-space-threeunits);",
    "padding-bottom: var(--dl-space-space-threeunits);",
  ]);
  assertDeclarations(".home-logo3 {", ["width: 72px;", "height: 72px;"]);
  assertDeclarations(".home-value {", ["font-size: 24px;", "line-height: 36px;"]);
});

test("mobile keeps its typography and uses tighter vertical spacing", () => {
  const firstServiceTablet = css.indexOf("@media(max-width: 991px)");
  const secondServiceTablet = css.indexOf("@media(max-width: 991px)", firstServiceTablet + 1);
  const tablet = css.indexOf("@media(max-width: 991px)", css.indexOf(".home-container"));
  const mobile = css.indexOf("@media(max-width: 767px)");

  assert.ok(firstServiceTablet >= 0, "Missing first service 991px media query");
  assert.ok(secondServiceTablet >= 0, "Missing second service 991px media query");
  assert.ok(tablet >= 0, "Missing homepage 991px media query");
  assert.ok(mobile >= 0, "Missing 767px media query");

  assertBlockDeclarations(".home-header2 {", ["padding-bottom: 64px;"], tablet);
  assertBlockDeclarations(".home-title1 {", ["font-size: 40px;", "line-height: 36px;"], tablet);
  assertBlockDeclarations(".home-description1 {", ["font-size: 16px;", "line-height: 24px;"], tablet);
  assertBlockDeclarations(".home-description2 {", [
    "margin-top: var(--dl-space-space-twounits);",
    "padding-top: var(--dl-space-space-twounits);",
    "padding-bottom: var(--dl-space-space-threeunits);",
  ], tablet);
  assertBlockDeclarations(".home-text8 {", ["font-size: 18px;", "line-height: 27px;"], tablet);
  assertBlockDeclarations(".home-apps {", [
    "gap: var(--dl-space-space-twounits);",
    "padding-bottom: 40px;",
  ], tablet);
  assertBlockDeclarations(".home-apps-header {", [
    "padding-top: var(--dl-space-space-twounits);",
    "padding-bottom: var(--dl-space-space-unit);",
  ], tablet);
  assertBlockDeclarations(".home-apps .heading,", ["font-size: 30px;", "line-height: 27px;"], tablet);
  assertBlockDeclarations(".home-app-artwork,", ["padding: var(--dl-space-space-oneandhalfunits);"], tablet);
  assertBlockDeclarations(".home-app-name {", ["font-size: 24px;", "line-height: 24px;"], tablet);
  assertBlockDeclarations(".home-app-lead {", ["font-size: 24px;", "line-height: 32px;"], tablet);
  assertBlockDeclarations(".home-app-description {", ["font-size: 16px;", "line-height: 24px;"], tablet);
  assertBlockDeclarations(".home-app-feature {", ["font-size: 14px;", "line-height: 21px;"], tablet);
  assertBlockDeclarations(".home-store-badge {", ["height: 54px;"], tablet);
  assertBlockDeclarations(".home-services {", [
    "gap: var(--dl-space-space-twounits);",
    "padding-bottom: 40px;",
  ], tablet);
  assertBlockDeclarations(".home-header3 {", [
    "padding-top: var(--dl-space-space-twounits);",
    "padding-bottom: var(--dl-space-space-unit);",
  ], tablet);
  assertBlockDeclarations(".home-information {", [
    "padding-top: var(--dl-space-space-twounits);",
    "padding-bottom: var(--dl-space-space-twounits);",
  ], tablet);
  assertBlockDeclarations(".service-title {", ["font-size: 18px;", "line-height: 16px;"], firstServiceTablet);
  assertBlockDeclarations(".service-description {", ["font-size: 14px;", "line-height: 21px;"], firstServiceTablet);
  assertBlockDeclarations(".service-title1 {", ["font-size: 18px;", "line-height: 16px;"], secondServiceTablet);
  assertBlockDeclarations(".service-description1 {", ["font-size: 14px;", "line-height: 21px;"], secondServiceTablet);
  assertBlockDeclarations(".home-header2 {", ["padding-bottom: 64px;"], mobile);
  assertBlockDeclarations(".home-store-badge {", ["height: 48px;"], mobile);
  assertBlockDeclarations(".home-app-artwork-link,", ["max-width: 420px;"], tablet);
});

test("Our Apps has desktop, responsive, and focus styles", () => {
  const requiredSelectors = [
    ".home-apps {",
    ".home-apps-header {",
    ".home-apps-grid {",
    ".home-app-card {",
    ".home-app-artwork {",
    ".home-app-artwork-link {",
    ".home-app-artwork-link:hover,",
    ".home-app-artwork-link:focus-visible,",
    ".home-app-image {",
    ".home-app-details {",
    ".home-app-features {",
    ".home-app-learn-more {",
    ".home-app-links {",
    ".home-store-link:focus-visible {",
    ".home-store-badge {",
  ];

  for (const selector of requiredSelectors) {
    assert.ok(css.includes(selector), `Missing CSS selector: ${selector}`);
  }

  assertDeclarations(".home-app-artwork-link {", [
    "display: inline-flex;",
    "width: 100%;",
    "max-width: 460px;",
    "transition: opacity 0.3s;",
  ]);
  assertDeclarations(".home-app-artwork-link:hover,", ["opacity: 0.65;"]);
  assertDeclarations(".home-app-artwork-link:focus-visible,", [
    "outline: 3px solid #235536;",
    "outline-offset: 4px;",
  ]);
  assertDeclarations(".home-app-learn-more {", [
    "color: #151515;",
    "font-size: 16px;",
    "line-height: 26px;",
    "text-decoration: underline;",
    "text-underline-offset: 4px;",
  ]);

  assert.match(css, /@media\(max-width: 991px\)[\s\S]*\.home-app-card \{[\s\S]*?grid-template-columns: 1fr;/);
  assert.match(css, /@media\(max-width: 767px\)[\s\S]*\.home-app-features \{[\s\S]*?grid-template-columns: 1fr;/);
  assert.match(css, /@media\(max-width: 479px\)[\s\S]*\.home-app-links \{[\s\S]*?flex-direction: column;/);
});
