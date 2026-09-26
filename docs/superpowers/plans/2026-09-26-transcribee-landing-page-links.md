# Transcribee Landing Page Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Link the Transcribee artwork and a visible `Learn more` action to `https://transcribee.app` while preserving the existing card and marketplace actions.

**Architecture:** Add two explicit external anchors to the existing static Transcribee card rather than making the card itself clickable. Extend the card's existing CSS interaction language for understated hover and focus states, then update the content-derived stylesheet cache version after all CSS bytes are final.

**Tech Stack:** Static HTML, CSS, Node.js built-in test runner, Node.js `assert`, SHA-256 via `node:crypto` and `shasum`.

## Global Constraints

- Change only the Transcribee card on the main homepage and its focused regression tests.
- Use the canonical destination `https://transcribee.app` for exactly two links: the artwork and visible `Learn more` text.
- Both links must use `target="_blank"` and `rel="noopener noreferrer"`.
- Keep the Services section, footer, 404 page, marketplace URLs, card copy, and responsive breakpoints unchanged.
- Keep the rest of the app card non-clickable.
- Preserve the artwork dimensions, card spacing, and current desktop and mobile layouts.
- Keep the existing `991px`, `767px`, and `479px` breakpoints; do not add a new breakpoint.
- The final `index.html` CSS query must equal the first eight characters of the SHA-256 hash of `index.css`.
- Do not stage unrelated `.DS_Store`, `.superpowers/`, existing files under `docs/superpowers/plans/`, `node_modules/`, or `package-lock.json`.

---

### Task 1: Add Accessible Transcribee Website Links

**Files:**
- Modify: `tests/our-apps.test.mjs:29-101`
- Modify: `index.html:132-187`

**Interfaces:**
- Consumes: Existing Transcribee artwork, feature list, and marketplace link markup.
- Produces: `.home-app-artwork-link` and `.home-app-learn-more` anchors targeting `https://transcribee.app`; Task 2 styles and tests these classes.

- [ ] **Step 1: Add the failing landing-page link test**

Add the URL constant beside the marketplace URL constants:

```js
const transcribeeUrl = "https://transcribee.app";
```

Add this test after `Transcribee uses the approved copy and feature highlights`:

```js
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
```

- [ ] **Step 2: Run the test and verify the missing links fail**

Run:

```bash
npm test
```

Expected: FAIL only in `Transcribee artwork and Learn more link to its website` with `Expected exactly two Transcribee website links`.

- [ ] **Step 3: Make the artwork clickable**

Replace the image directly inside `.home-app-artwork` with:

```html
<a
  href="https://transcribee.app"
  class="home-app-artwork-link"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Visit the Transcribee website"
>
  <img
    src="public/transcribee.png"
    alt="Transcribee logo"
    class="home-app-image"
  />
</a>
```

- [ ] **Step 4: Add the visible Learn more link**

Insert this anchor after `</ul>` for `.home-app-features` and before `<div class="home-app-links">`:

```html
<a
  href="https://transcribee.app"
  class="home-app-learn-more"
  target="_blank"
  rel="noopener noreferrer"
>
  Learn more
</a>
```

- [ ] **Step 5: Run the full tests and whitespace check**

Run:

```bash
npm test && git diff --check
```

Expected: PASS with `10` tests, `0` failures, and no whitespace errors.

- [ ] **Step 6: Commit the semantic links**

```bash
git add index.html tests/our-apps.test.mjs
git commit -m "Link Transcribee website"
```

---

### Task 2: Style And Verify The Landing-Page Actions

**Files:**
- Modify: `tests/our-apps.test.mjs:261-283`
- Modify: `index.css:346-433`
- Modify: `index.html:51`

**Interfaces:**
- Consumes: `.home-app-artwork-link` and `.home-app-learn-more` anchors from Task 1; existing `ruleBody()` and `assertDeclarations()` CSS test helpers.
- Produces: Responsive-safe link sizing, hover opacity, visible keyboard focus, underlined text treatment, and a synchronized stylesheet cache query.

- [ ] **Step 1: Add failing CSS interaction assertions**

Add these selectors to `requiredSelectors` in `Our Apps has desktop, responsive, and focus styles`:

```js
".home-app-artwork-link {",
".home-app-artwork-link:hover,",
".home-app-artwork-link:focus-visible,",
".home-app-learn-more {",
```

Then add these assertions after the selector loop:

```js
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
assertBlockDeclarations(".home-app-artwork-link,", ["max-width: 420px;"], tablet);
```

Place the final `assertBlockDeclarations` call in `mobile keeps its typography and uses tighter vertical spacing`, where `tablet` is already defined. Place the other assertions in `Our Apps has desktop, responsive, and focus styles` after its selector loop.

- [ ] **Step 2: Run the test and verify the missing styles fail**

Run:

```bash
npm test
```

Expected: FAIL in `Our Apps has desktop, responsive, and focus styles`, first reporting `Missing CSS selector: .home-app-artwork-link {`.

- [ ] **Step 3: Add artwork-link sizing and shared hover treatment**

Insert this rule immediately before `.home-app-image`:

```css
.home-app-artwork-link {
  width: 100%;
  display: inline-flex;
  max-width: 460px;
  transition: opacity 0.3s;
}
```

In the existing homepage `@media(max-width: 991px)` block, expand the current image rule so the link and image retain the same mobile maximum width:

```css
.home-app-artwork-link,
.home-app-image {
  max-width: 420px;
}
```

Insert this grouped rule before `.home-store-link:hover`:

```css
.home-app-artwork-link:hover,
.home-app-learn-more:hover {
  opacity: 0.65;
}
```

Keep the existing `.home-store-link:hover` rule unchanged.

- [ ] **Step 4: Add the Learn more text treatment**

Insert this rule immediately before `.home-app-links`:

```css
.home-app-learn-more {
  color: #151515;
  font-size: 16px;
  line-height: 26px;
  transition: opacity 0.3s;
  text-decoration: underline;
  text-underline-offset: 4px;
}
```

- [ ] **Step 5: Share the existing keyboard-focus treatment**

Replace the current `.home-store-link:focus-visible` selector with the grouped selectors below while retaining the existing declaration body:

```css
.home-app-artwork-link:focus-visible,
.home-app-learn-more:focus-visible,
.home-store-link:focus-visible {
  outline: 3px solid #235536;
  outline-offset: 4px;
}
```

- [ ] **Step 6: Confirm the style test passes and the old cache query fails**

Run:

```bash
npm test
```

Expected: the new link and style assertions PASS; `the page requests the current version of the home-page stylesheet` FAILS because `index.css` changed.

- [ ] **Step 7: Synchronize the stylesheet cache query**

Calculate the final version:

```bash
shasum -a 256 index.css
```

Replace the eight hexadecimal characters after `index.css?v=` in `index.html` with the first eight hash characters. Do not modify any other HTML.

- [ ] **Step 8: Run final automated verification**

Run:

```bash
npm test && git diff --check
```

Expected: PASS with `10` tests, `0` failures, and no whitespace errors.

Confirm unrelated pages are unchanged:

```bash
git diff --quiet -- 404.html 404.css
```

Expected: exit status `0` and no output.

- [ ] **Step 9: Render and inspect desktop and mobile layouts**

Start the local server:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Capture the homepage with installed Chrome at `1280px`, `991px`, `767px`, and `500px`. Verify:

- The artwork remains the same apparent size and position.
- `Learn more` appears between the features and marketplace badges without competing with them.
- The two-column desktop and stacked mobile card layouts are unchanged.
- Both new links show the green offset outline when keyboard-focused.
- No content overflows horizontally at `500px`.
- The Services section, footer, and 404 files are unchanged.

- [ ] **Step 10: Commit styling and cache synchronization**

```bash
git add index.css index.html tests/our-apps.test.mjs
git commit -m "Style Transcribee website links"
```
