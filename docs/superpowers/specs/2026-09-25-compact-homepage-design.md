# Compact Homepage Design

## Goal

Make the Cyfertek homepage feel substantially more compact on desktop while preserving its existing visual identity and current mobile typography. Reduce oversized display type, tall sections, and excessive whitespace without changing content, page order, colours, borders, or responsive structure.

## Scope

This change applies only to the main homepage through `index.css` and the homepage stylesheet reference in `index.html`. The standalone 404 page, shared component files, content, links, images, navigation behaviour, and JavaScript remain unchanged.

## Approach

Adjust homepage selectors directly rather than changing global spacing tokens in `style.css`. This keeps the compact scale isolated to the homepage and allows desktop typography and mobile spacing to be tuned independently.

## Desktop Scale

Above the existing 991px breakpoint, use these target values:

### Header and Hero

- Navbar top padding: `20px` instead of `32px`.
- Hero content top padding: `64px` instead of `96px`.
- Hero content bottom padding: `96px` instead of `150px`.
- Hero title: `88px` with `82px` line height instead of `128px` with `115px` line height.
- Hero description: `20px` with `30px` line height instead of `24px` with `36px` line height.

### Introduction

- Top margin: `48px` instead of `80px`.
- Top padding: `48px` instead of `80px`.
- Bottom padding: `72px` instead of `120px`.
- Introduction copy: `24px` with `36px` line height instead of `32px` with `48px` line height.

### Section Rhythm

- Our Apps and Services top/bottom padding: `72px` instead of `120px`.
- Major section gap: `48px` instead of `80px`.
- Section-header bottom padding: `32px` instead of `48px`.
- Homepage section headings: `56px` with `52px` line height instead of the shared `80px` with `72px` line height.
- Apply the heading override only to `.home-apps .heading` and `.home-services .heading`; do not change the global `.heading` rule.

### Transcribee Card

- Artwork minimum height: `380px` instead of `520px`.
- Artwork padding: `32px` instead of `48px`.
- Details padding: `40px` instead of `64px`.
- Details gap: `24px` instead of `32px`.
- App name: `30px` with `30px` line height instead of `40px` with `36px` line height.
- Lead: `24px` with `32px` line height instead of `32px` with `42px` line height.
- Description: `16px` with `26px` line height instead of `20px` with `32px` line height.
- Feature text: `14px` with `21px` line height instead of `16px` with `24px` line height.
- Store badges: `46px` high instead of `54px`.
- Preserve the two-column card layout, artwork proportions, feature grid, links, and borders.

### Services and Footer

- Service titles: `30px` with `30px` line height instead of `40px` with `36px` line height.
- Service descriptions: `16px` with `28px` line height instead of `36px` line height.
- Service item gap and bottom padding: `24px` and `32px` respectively.
- Footer information top/bottom padding: `48px` instead of `80px`.
- Footer logo: `72px` square instead of `102px` by `104px`.
- Footer email: `24px` with `36px` line height instead of `32px` with `48px` line height.
- Preserve the footer image dimensions and layout.

## Mobile Scale

At 991px and below, preserve the current typography values, including:

- Hero title: `40px/36px`.
- Hero description: `16px/24px`.
- Introduction: `18px/27px`.
- Section headings: `30px/27px`.
- App name: `24px/24px`; app lead: `24px/32px`.
- App description: `16px/24px`.
- App features: `14px/21px`.
- Service titles and descriptions: `18px/16px` and `14px/21px`.

Only tighten mobile vertical rhythm:

- Hero bottom padding: `64px` at both mobile breakpoints.
- Introduction margin/top padding: `32px`; bottom padding: `48px`.
- Our Apps and Services gap: `32px`; bottom padding: `40px`.
- Section-header top padding: `32px`; bottom padding: `16px`.
- App artwork and details padding: `24px`.
- Footer information top/bottom padding: `32px`.
- Keep store badges at their current mobile sizes: `54px` through 991px and `48px` through 767px.
- Preserve the existing one-column card, one-column feature list at 767px, and vertically stacked store links at 479px.

## Cache Versioning

After the CSS changes are final, calculate the first eight characters of the SHA-256 hash of `index.css` and update the `index.html` stylesheet query parameter to that value. Extend the regression test to require the new version so browsers cannot combine fresh HTML with stale homepage CSS.

## Testing and Verification

- Extend `tests/our-apps.test.mjs` with assertions for the agreed desktop scale and mobile spacing overrides.
- Run `npm test` and `git diff --check`.
- Render the page in Chrome at 1280px, 991px, 767px, and the smallest supported headless viewport.
- Confirm the desktop page is visibly shorter, section hierarchy remains clear, and text does not overflow.
- Confirm mobile typography matches its current sizes while vertical whitespace is reduced.
- Confirm the Our Apps card, store badges, Services section, and footer retain their existing responsive structure.
- Confirm the 404 page and its styles are unchanged.
