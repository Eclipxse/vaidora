disposition: recapture

Scope: Source-only supplement in the five sections requested by the parent; this is not a visual finish verdict. Current desktop/mobile captures are unavailable, and all existing review screenshots depict the prior look. No browser, renderer, detector, or workaround was used. No approved comp is expected for this code-led continuation. Quality-bar card and corroborated concept seed were not supplied. Primary storefront sources, layouts, relevant inherited CSS, PRODUCT.md, and direction.md were inspected; unrelated admin and catalog internals were not reviewed.

## persistence

Pass for the inspected product contract: docs/PRODUCT.md exists and records the 87-name catalog, category counts, actual format prices, photography limits, and WhatsApp-only enquiry behavior. .impeccable/direction.md records the latest bold palette/type/motion steering and explicitly disclaims current visual validation. Comp phases are not applicable to this code-led continuation. The direction document is a prose continuation brief, not the five-block seeded contract described by the reviewer role; no retrospective seed or approval should be invented. Parent reports production build, typecheck, and 10/10 tests passed; this review did not rerun them.

## fidelity

No rendered element matrix can be certified from stale captures. The following are source observations only:

| Promise | Source evidence | Limit |
| --- | --- | --- |
| TYPE | Syne 700/800 is imported in the store layout; Manrope is imported in the root layout; heading/product/control assignments match direction.md. | Actual loaded face, line breaks, clipping, and optical spacing are unverified. Negative tracking violations are listed below. |
| MATERIAL | Hero, travel, and personal sections use existing product/master image references through next/image. No generated replacement imagery or fake physical material was found in these files. | Current crop, visible resolution, and image presence are unverified. |
| GROUND | CSS explicitly uses the agreed cobalt #2f3fce, citron #e5f28d, porcelain #f8f9f5, and ink #1a2040. | Net rendered colors are unverified. Dark-mode inherited controls have a confirmed contrast defect. |
| FIRST VIEWPORT / STORY | Split hero, three headline lines, dynamic count/minimum price, size-switching portrait, category index, collection, travel, formats, personal collection, and WhatsApp sections exist in the declared order. | Fold composition and responsive overflow cannot be assessed from source alone. |
| MOTION / ACCESSIBILITY | Reduced-motion CSS removes CSS animation; ribbon stops when paused, hidden, outside its observed area, or reduced motion is requested; visibility listeners and reveal animations are cleaned up; keyboard collection/size changes bypass animation. Tabs implement arrows/Home/End and useId-based panel relationships. | Motion timing, loading, hydration behavior, and actual keyboard focus visibility remain untested in the new render. |
| TRUTH | Inspected merchandising uses catalog names, enabled variant prices, computed counts, and WhatsApp draft links. Product cards disclose representative imagery when imageSize differs. No new discount, performance, certification, stock, or order-completion claims were introduced in inspected files. | Underlying catalog persistence and owner features are outside this pass. |

## ceiling

Unassessed: current captures and the quality-bar card are missing. Source establishes a committed type/color/motion direction, but cannot establish visual quality, photographic integration, font fit, mobile finish, or whether the animation feels coherent. No visual-ceiling approval is implied.

## material_fixes

1. Evidence: retain visual status as unverified until current desktop.png and mobile.png (and current user-430.png if that viewport remains a required review input) can be captured through an allowed path; existing files are stale and must not validate this design. This is not a request to bypass the recorded browser security rejection.
2. Contrast, dark catalog filters: storefront.css changes --ink to #eceeff while globals.css:900-910 leaves .tabs button white and .tabs button.selected white-on-var(--ink). catalog-grid.tsx:85 uses these selectors. Both states calculate to approximately 1.15:1 in dark mode. Set explicit storefront tab foreground/background values, including selected and hover/focus states, using --surface/--ink or the agreed palette.
3. Contrast, combined increased-contrast and dark preferences: globals.css:2823-2826 forces .muted, .small, and small to #34495e. The storefront's prefers-contrast rule only updates variables and cannot override that literal declaration on elements such as catalog-grid.tsx:100 and the search dialog's .small.muted status. On dark --surface #141a30 that becomes approximately 1.85:1. Add a scoped high-contrast storefront override for these actual text selectors using var(--ink).
4. Keyboard focus on cobalt: storefront.css:36 sets focus outlines to #6174fc, which is approximately 1.99:1 against cobalt #2f3fce. Hero and personal-collection CTA outlines therefore lack the 3:1 nontext contrast target. Use a surface-aware ring, such as citron on cobalt, while preserving a contrasting ring on porcelain/citron and dark surfaces.
5. Craft-floor ban: delete the four visible pre-heading kickers in page.tsx (hero, travel, personal collection) and storefront-home.tsx (collection introduction), then remove their unused styles. storefront.css:243 explicitly displays them; they are not hidden legacy markup. Headings already communicate those sections.
6. Craft-floor type: clamp heading, hero, and ribbon tracking to at least -0.04em; current declarations are -0.055em, -0.075em, and -0.05em in storefront.css:44,238,303. Preserve the explicitly requested bold display scale and font character, then assess actual line fit when current render access returns.

## keep

Preserve the agreed cobalt/citron/Syne direction, original logo and bottle photography, catalog-derived prices/counts, working product-specific WhatsApp drafts, two-column mobile catalog, keyboard tab behavior, paused/offscreen/hidden/reduced-motion ribbon lifecycle, and visible default content while applying the source fixes; none of those observations certify visual finish.

### Bounded source-fix check

This is an appended source check of the five reported fixes, not a visual verdict pass or a new defect hunt. Current render evidence remains unavailable; disposition remains **recapture**.

- **Resolved in source — dark catalog tabs:** scoped normal/hover colors use --surface/--soft and --ink; selected tabs use white on cobalt, approximately 7.71:1. Dark normal text is approximately 14.95:1.
- **Resolved in source — increased-contrast text:** `.store-shell :is(.muted, .small, small)` now overrides the inherited literal color with var(--ink). The portrait caption locally defines --ink as #f3f5f7 to retain readable text on its fixed dark surface.
- **Resolved in source — focus colors:** hero and personal sections now use citron focus on cobalt (approximately 6.40:1); the portrait/concierge, ribbon/travel, and dark main surface have local or theme-appropriate colors. Follow-up inspection confirmed storefront.css:127 explicitly sets `--focus: var(--cobalt)` on `.announcement-wrap`, resolving the inherited pale dark-mode ring on that fixed citron strip.
- **Resolved in source — kickers:** no hero-kicker/section-kicker nodes remain in the home page or CollectionShowcase, and their styles were removed.
- **Resolved in source — tracking:** heading, hero, and ribbon values now use -0.04em; the requested display scale and font assignment remain.

Remaining evidence finding: **unresolved**. Current visuals, actual responsive line fit, and rendered focus behavior remain unverified. No screenshot request or browser workaround was made. Production rebuild was reported underway during this bounded source check.
