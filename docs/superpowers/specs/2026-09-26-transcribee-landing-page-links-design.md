# Transcribee Landing Page Links Design

## Goal

Link the Transcribee app card to its product website at `https://transcribee.app` without weakening the existing Google Play and App Store calls to action.

## Scope

Change only the Transcribee card on the main homepage and its focused regression tests. The Services section, footer, 404 page, marketplace URLs, card copy, and responsive breakpoints remain unchanged.

## Interaction Design

The Transcribee artwork becomes a link to `https://transcribee.app`. A second, visible `Learn more` text link appears in the details column after the feature list and before the marketplace badges. These are two separate links to the same destination; the rest of the card remains non-clickable so the marketplace links retain clear, independent targets.

Both landing-page links open in a new tab and include `rel="noopener noreferrer"`. The artwork link has an explicit accessible label identifying the Transcribee website. The text link uses its visible `Learn more` copy as its accessible name.

## Visual Treatment

The artwork keeps its current dimensions and position. Its link fills only the image area rather than the entire artwork column. Hover treatment uses the restrained opacity behavior already established by the marketplace links, and keyboard focus receives the same green, offset outline.

The `Learn more` link is an understated text action rather than a competing badge or filled button. It uses the card's existing typography and dark color, remains visibly underlined, and receives matching hover and focus feedback. Existing card spacing and the current desktop and mobile layouts remain intact.

## Implementation Boundaries

- Modify `index.html` to add the artwork anchor and visible `Learn more` anchor.
- Modify `index.css` only for the new link display, hover, and focus states.
- Preserve the existing `991px`, `767px`, and `479px` breakpoints without adding link-specific media queries unless verification identifies an actual overflow issue.
- Recalculate the eight-character SHA-256 cache query in `index.html` after the final CSS bytes are known.

## Testing And Verification

Automated tests will verify that exactly two Transcribee landing-page links exist, both use the canonical HTTPS URL, both open in a new tab with safe `rel` attributes, the artwork link has an accessible label, and the visible link says `Learn more`. CSS tests will require hover and keyboard-focus treatment for both new link types. The existing content-derived stylesheet cache test must continue to pass.

Render the homepage at representative desktop and mobile widths to confirm that the image remains correctly sized, the new text link does not compete with or displace the store badges, keyboard focus is visible, and no horizontal overflow is introduced.
