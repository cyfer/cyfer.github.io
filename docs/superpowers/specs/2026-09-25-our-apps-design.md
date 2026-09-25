# Our Apps Section Design

## Goal

Add an "Our Apps" section to the Cyfertek home page that introduces Transcribee and sends visitors to its Google Play and App Store listings. The section should present Cyfertek's current product clearly while providing a reusable grid structure for additional apps in the future.

## Placement and Visual Direction

Place the section between the company introduction and the existing Services section. Match the site's established visual language: a 1280px maximum content width, generous spacing, uppercase section heading, dark borders, Noto Sans typography, and responsive breakpoints consistent with the rest of the page.

The section will contain a grid with one wide editorial card. Do not display an empty or "coming soon" card. The card will use two columns on larger screens:

- An artwork panel displaying the user-provided Transcribee artwork.
- A product-details panel containing the app name, marketing copy, feature highlights, and store badges.

On narrower screens, the card will stack vertically. The store badges may wrap when needed, while remaining large enough to read and tap.

Represent the app as one semantic `article` inside a CSS grid so future app articles can be added as siblings without introducing a separate component system or JavaScript.

## Content

Section heading:

> OUR APPS

App name:

> Transcribee

Lead:

> AI transcription that keeps up with you.

Description:

> Turn audio and video into accurate transcripts and useful summaries in more than 90 languages.

Feature highlights:

- AI transcripts & summaries
- 90+ languages
- Live transcription & translation
- 60 free minutes

## Store Links

Use official Google Play and App Store badges, stored locally with the other public assets for reliable rendering.

- Google Play: `https://play.google.com/store/apps/details?id=com.cyfertek.aitranscribe`
- App Store: `https://apps.apple.com/gb/app/transcribee-speech-to-text/id6752488311`

Each badge will be a link that opens the corresponding store listing in a new tab. Links will use `rel="noopener noreferrer"` and descriptive accessible labels that identify both Transcribee and the destination store.

## Assets

Save the user-provided Transcribee artwork as `public/transcribee.png`, preserve its aspect ratio, and render it with `object-fit: contain`. Give the image concise alternative text identifying it as the Transcribee logo. Store the official marketplace badges as `public/google-play-badge.png` and `public/app-store-badge.svg`.

## Implementation Boundaries

This is a static HTML and CSS change to `index.html` and `index.css`, plus local image assets. No JavaScript, framework migration, unrelated refactoring, app detail page, analytics, or navigation changes are included.

## Responsive and Accessibility Requirements

- Preserve the existing desktop maximum width and page alignment.
- Stack the artwork and details at the site's existing tablet/mobile breakpoint.
- Ensure content and badges do not overflow at 991px, 767px, or 479px widths.
- Preserve readable text sizing and adequate touch targets.
- Include useful image alternative text and descriptive store-link labels.
- Maintain visible keyboard focus on both store links.

## Verification

Because the repository has no configured test or build scripts, verify the change through static inspection and browser rendering:

- Confirm the section appears between the introduction and Services.
- Check desktop, tablet, and mobile layouts, including the existing breakpoints.
- Confirm artwork and badge assets load from local paths.
- Open both marketplace links and confirm they reach the supplied Transcribee listings.
- Check keyboard focus and accessible names for both badge links.
- Confirm the rest of the page remains unchanged.
