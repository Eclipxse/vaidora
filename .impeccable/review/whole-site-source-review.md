disposition: recapture

Bounded source review of the whole-site extension: StoreIntro, content pages, the changed product-detail and bundle controls, catalog recovery controls, four route headers, the footer About link, and their relevant new/inherited CSS. No browser, rendered capture, detector rerun, or generic craft hunt was used. Current visual finish remains unverified.

## Actionable finding

- **P2 — Mobile colored page headers lose their inset.** StoreIntro carries both `page-heading` and `store-intro`. In storefront.css, the <=760px `.store-shell .store-intro` padding at line 1626 is overwritten by the later, equally specific `.store-shell .page-heading { padding: 36px 0 26px }` at line 1992. At 371–760px, collection, saved-fragrance, and bundle headings therefore sit against the colored panel edge. The <=370px override happens to restore padding. Move the StoreIntro override after the generic rule or exclude `.store-intro` from that generic rule; preserve zero inline padding specifically for `.intro-paper`.

## Bounded checks

The new informational navigation has working local route targets and aria-current; mobile removes sticky positioning. Native FAQ disclosure semantics remain. Product sizes retain button names, aria-pressed, scoped shared-layout IDs, and zero-duration keyboard/reduced-motion selection; the selected fill and price colors have explicit palette values. Bundle progress uses a labelled native progress element and visible/live selection counts; fragrance selects retain associated labels. Empty saved-state recovery, footer About navigation, and route header data use existing products/settings rather than fabricated values. No additional material issue was established in this bounded source pass.

Build/typecheck were reported underway, not independently rerun here. Current screenshots and runtime evidence are still unavailable, so source review does not certify responsive rendering, animation, or visual completion.

## Bounded correction check

- **Resolved in source — mobile StoreIntro inset:** storefront.css:1993 now limits the later generic padding rule to `.page-heading:not(.store-intro)`, preserving the dedicated colored-header padding and the paper-header exception.
- **Confirmed in source — bundle CTA sizing:** storefront.css:1292 explicitly uses `flex: 0 1 auto`, overriding the inherited zero flex basis for the longer CTA.
- **Confirmed in source — enabled initial product size:** product-detail.tsx:40-44 resolves the requested size only from enabled variants, then 100 ML, then the first enabled variant; nullish fallback preserves the valid car-diffuser size 0. The selected class, aria-pressed, and shared fill all use resolved `v.id` at lines 168, 177, and 179.

Only these correction lines were checked. Parent reports 10/10 tests and the previous build/typecheck passed, with the final rebuild underway. No source finding remains from this bounded pass. Disposition remains **recapture** because current rendered visuals and behavior remain unverified.
