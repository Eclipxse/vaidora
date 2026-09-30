---
name: Vaidora storefront
description: A framed fragrance storefront using original Vaidora photography and personal WhatsApp enquiry.
colors:
  gold: "#b28c42"
  accent-text: "#7f5c24"
  burgundy: "#552121"
  fact-burgundy: "#2d0a06"
  cream: "#f7f4ef"
  surface: "#fff"
  ink: "#282828"
  muted: "#69635b"
  line: "#e2dbcf"
  panel: "#f0e9dc"
  photo-ground: "#30271f"
  campaign-ground: "#27211b"
  button-ink: "#21180d"
  warm-white: "#f6eee2"
  focus-on-dark: "#ffe58e"
typography:
  display:
    fontFamily: "Arsenal, Georgia, serif"
    fontSize: "clamp(42px, 4.4vw, 68px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "0"
  headline:
    fontFamily: "Arsenal, Georgia, serif"
    fontSize: "44px"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "0"
  title:
    fontFamily: "Urbanist, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0"
  body:
    fontFamily: "Urbanist, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.4
  action:
    fontFamily: "Urbanist, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0"
rounded:
  control: "6px"
  field: "5px"
  card: "8px"
  wide-campaign: "28px"
  circular: "50%"
spacing:
  compact: "12px"
  inset: "16px"
  medium: "20px"
  regular: "24px"
  open: "32px"
  broad: "40px"
components:
  button-primary:
    textColor: "{colors.button-ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  button-light:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "11px 13px"
  filter:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "10px 20px"
  filter-selected:
    backgroundColor: "{colors.burgundy}"
    textColor: "{colors.surface}"
    rounded: "{rounded.field}"
    padding: "10px 20px"
  product-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  product-card-body:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    padding: "12px 10px 10px"
  rail-arrow:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.button-ink}"
    rounded: "{rounded.circular}"
    size: "44px"
---

# Design System: Vaidora storefront

## Overview

**Creative North Star: "Framed fragrance storefront"**

Cream browsing surfaces, gold geometric frames and burgundy campaign bands give Vaidora's original logo and bottle photographs a clear retail hierarchy. Arsenal headlines introduce collections and campaigns; compact Urbanist names, prices and controls keep the catalog readable. The photographic bottle remains the subject, with ornament around it; the opening campaign places it over a full-bleed environment expanded from the supplied photograph's empty background and floor.

The user pinned the AdilQadri homepage as visual authority for this world, substituting Vaidora branding and the supplied catalog. The system applies to public store pages and shared store components. Storefront overrides remain scoped; owner tools retain their existing operational interface. Catalog truth constrains every visual treatment: exact supplied names, actual option prices and customer-sent WhatsApp drafts.

**Evidence boundary:** recorded from the storefront source on 2026-09-30 after the reference correction batch. The earlier cobalt specification is superseded. The [initial reference finish review](../.impeccable/review/reference-finish-review.md) records `disposition: fix`; its findings prompted the current changes and are not an approval of them. Fresh capture review is a separate gate. This document records implementation, without certifying final visual review, whole-site pixel identity, runtime performance or accessibility conformance.

**Key Characteristics:**

- Cream and white catalog surfaces punctuated by burgundy and deep burgundy bands.
- Self-hosted Arsenal headlines and compact Urbanist product names, reading text and controls.
- Original photographic bottles inside gold pointed, lobed and scalloped geometry.
- Full-bleed five-slide campaigns and native horizontal product rails.
- Centered original brand mark, native navigation/search dialogs and fixed mobile navigation.
- Catalog-derived choices and prices with representative-image disclosure and personal enquiry.

## Colors

Warm neutral browsing grounds support gold actions and ornament; burgundy gives featured products, enquiry guidance and the footer their visual weight.

### Primary

- **Gold:** announcement ground, rail controls, category outlines, campaign outlines and fact medallions.
- **Gold accent text:** selected links, price-format figures and small text on pale surfaces. This deeper tone provides a separate reading role from decorative gold.

### Secondary

- **Burgundy:** featured rail, saved-control state, utility icons and the continuous enquiry/footer region.
- **Deep fact burgundy:** the six-fact band, darker than the featured rail and footer.
- **Focus on dark:** visible focus against burgundy grounds and the brightest point of the primary button gradient.

### Neutral

- **Cream:** the page canvas, story section and mobile navigation.
- **White surface:** header, category section, cards, fields and dialogs.
- **Ink, muted and line:** main reading, secondary reading and thin dividers. Increased-contrast preference strengthens muted text and dividers.
- **Panel:** pale utility and bundle image wells.
- **Photo ground and campaign ground:** dark wells around the original bottle imagery.
- **Button ink:** text on gold actions. **Warm white:** supporting campaign copy.

**The Paired Foreground Rule.** Light catalog surfaces use ink; burgundy sections use white and a light focus outline. Decorative gold and the deeper gold text role are separate jobs.

The primary action uses a metallic gold gradient (`linear-gradient(45deg, #a66d30, #ffe58e 50%, #e0b057)`). Its full treatment is recorded in the [sidecar](../.impeccable/design.json), because a gradient is not a color primitive.

## Typography

**Display Font:** self-hosted Arsenal, with Georgia and serif fallbacks; storefront imports include weights 400 and 700.

**Body Font:** self-hosted Urbanist, with Arial and sans-serif fallbacks; storefront imports include weights 400, 500, 600 and 700.

**Character:** restrained Arsenal headings provide the campaign voice; Urbanist carries the dense browsing and option-selection work.

### Hierarchy

- **Display:** the frontmatter display role is the desktop campaign title, constrained to about 13 characters per line. Mobile campaign titles use 35px, then 32px below the narrow-phone breakpoint.
- **Headline:** shared section headings use the headline role and balanced wrapping; they reduce to 28px on mobile. Campaign and route headings have explicit local sizes.
- **Title:** product names use Urbanist with the title role, reducing to 14px in mobile rails. Preserve exact spelling and allow names to wrap.
- **Body:** the shell uses the body role; paragraphs open to a line-height of 1.6. The mobile shell is 15px. Editorial copy uses bounded measures, while long information-page prose allows about 72 characters.
- **Action and metadata:** buttons use the action role; category, size and navigation labels remain compact Urbanist. Prices use tabular numerals.

**The Two Voices Rule.** Arsenal carries campaign and section headings. Urbanist carries product names, reading, navigation and actions; product titles must not inherit a display face.

## Layout

The shared container has a maximum width (1520px), with 40px side gutters on wide screens and 16px at the mobile breakpoint. The hero fills the viewport width outside that container, with a source-photo environment plate covering the full campaign area beneath the separate original bottle cutout and copy. Desktop campaigns use a panoramic ratio (2.26), a left photographic subject and upper-right copy. Mobile campaigns use a tall ratio (0.8), centered copy above the bottle and controls below it.

Product grids use four desktop columns and two mobile columns. Native rails use four visible desktop cards with 24px gaps; mobile cards occupy 58% of the rail with 12px gaps, leaving the next card visible. The pocket section places a left heading beside a three-card rail on wide screens, uses a two-card rail at the intermediate breakpoint, and stacks the heading above the rail on mobile. Featured rail controls sit beside its heading.

The category section is white, with six tall frames visible on desktop and the seventh accessible by horizontal scrolling. Mobile retains a separate compact circle rail before the hero, then a tall framed category rail later in the page. Paired campaigns, story content, product details and information-page columns stack on mobile. Facts and price formats change from six columns to three; the four-column footer becomes two columns with full-width brand and contact blocks.

Desktop section spacing is component-specific, commonly about 42–70px; mobile sections commonly use 28–38px. Do not turn those observations into one universal multiplier. Breakpoints are 1100px for intermediate density, 700px for mobile composition and 370px for narrow-phone adjustments.

The mobile navigation reserves a safe-area-aware height (`max(66px, calc(54px + env(safe-area-inset-bottom)))`). Product enquiry controls occupy a separate fixed strip directly above it; the floating WhatsApp action moves above both. Product galleries are sticky beside details on desktop and static above details on mobile.

## Elevation & Depth

The catalog is flat at rest. White cards, dark photographic wells, colored section bands and fine gold framing establish depth. The header is solid white, with a divider-like shadow and no backdrop blur. Dialogs use the browser top layer with a diffuse shadow and slightly blurred backdrop. The floating enquiry control has a small lift.

### Shadow Vocabulary

- **Header divider:** `0 1px 0 #e2dbcf`, separating the sticky header from the page.
- **Dialog lift:** `0 20px 80px #21180d30`, with backdrop `#21180d70` and blur (2px).
- **Floating enquiry:** `0 5px 18px #28282828`, separating the fixed round action from content.

**The Flat Catalog Rule.** Product cards have no border or shadow. Photography, white card bodies and the surrounding section ground establish their hierarchy.

## Shapes

Controls are gently squared: primary actions use the control radius, fields and filter buttons use the field radius, and product cards and image wells use the card radius. Utility controls and favorites are circular. The wide bundle campaign is deliberately softer, using its wide-campaign radius on desktop and 18px on mobile.

Gold frame geometry is a signature rather than a universal corner treatment. Tall category portals use pointed stepped outlines; the story photograph uses a lobed architectural mask and gold frame; fact icons sit within filled scalloped medallions. These frames are SVG geometry around photographs, not generated bottle shapes. Paired campaigns use a fine gold outline offset outside the photographic panel; this is a border, not a hard offset shadow.

## Components

### Buttons

Gold actions use the frontmatter padding and shape with the metallic gradient described above. General buttons have a minimum height (46px). Hover darkens the gradient slightly (brightness 0.95); active state compresses to scale 0.97 over 180ms. Outline buttons have a gold border and gain a pale warm background on hover; light buttons remain white. Keyboard focus uses a 2px outline with 4px offset and the containing surface's focus role. Text actions remain unboxed with an underline on hover.

### Filters and tabs

Catalog filters are white bordered controls; selected filters become burgundy with white text. Home collection tabs are unboxed, uppercase and underlined when selected. Arrow Left/Right, Home and End move focus and selection, with one tab in the keyboard tab order. Switching groups resets the corresponding native product rail.

### Cards / Containers

Square original bottle photographs sit above compact white card bodies. A size badge and round favorite control occupy the photograph; saved favorites become burgundy with white icons. Names, tabular prices and the full-width gold **Choose options** action remain in that order. The action opens the real product option page. When the photographed capacity differs from the selected option, the representative-bottle note remains visible.

Fine-pointer hover scales product and category images slightly (1.025) over 350ms. This is an image treatment, not a card lift. Product details retain square photography, price-visible sizes, quantity controls and a real enquiry action. Bundle slots use original photography when selected, labelled native choices and actual completion progress.

### Inputs / Fields

Fields are white with ink text, a thin line-colored border and the field radius. The grouped search row has a minimum height (48px), an inline icon and text action, and a surface-aware focus-within outline. Search text remains 16px on mobile. Native disabled buttons retain reduced opacity and a disabled cursor. Empty results offer another query or a reset rather than invented catalog content.

### Navigation and dialogs

The sticky white header centers the supplied Vaidora mark between a menu trigger and search, saved and WhatsApp actions. Mobile adds two gold format links and a five-destination fixed navigation bar. Native menu and search dialogs preserve labelled controls, Escape dismissal and native focus handling. Footer navigation uses white text on burgundy with a pale gold hover state; the lower policy row inherits the same readable foreground.

### Campaign carousel and rails

Five campaign slides crossfade (550ms) with a seven-second interval. Previous/next controls, indicators and pause/play remain available. Autoplay stops during hover or focus interaction, outside the observed viewport, in a hidden document, under reduced motion, or after a manual slide selection until resumed. Inactive slides are hidden from interaction and assistive technology.

Product rails use native horizontal scrolling and snapping. Arrow controls move by a viewport width and disable at the corresponding end; reduced motion uses immediate scrolling. Category rails use proximity snapping. CSS reduced-motion rules remove transitions and animations; the carousel and rails also respect the preference in their JavaScript behavior.

**The Customer-Controlled Motion Rule.** Autoplay remains interruptible, inactive slides stay inert, and native browsing controls remain usable without decorative motion.

### Photographic frames and factual bands

Paired campaigns keep copy on one side and a real bottle on the other, enclosed by subtly offset gold outlines. The pale pocket rail uses a restrained geometric ground pattern. The story photo retains the lobed mask and gold overlay; six gold scalloped fact medallions sit on the deep burgundy band. Enquiry guidance and the footer share a continuous burgundy ground with an outlined guidance panel.

The derived raster cutouts in `public/display` come from source-photo color-gradient alpha mattes while retaining source bottle RGB pixels. The campaign environment plate expands the supplied photograph's empty background and floor beneath those cutouts; it does not regenerate the bottle or label. The [asset provenance record](../.impeccable/review/reference-build/asset-provenance.json) records 198 rasters with embedded provenance; adding metadata preserves decoded pixels. Original masters remain authoritative; only 12 ML and 100 ML have confirmed printed capacities.

## Do's and Don'ts

### Do:

- **Do** preserve the supplied Vaidora mark and original photographic bottle, label and glass.
- **Do** derive product names, categories, options, prices and counts from the verified catalog.
- **Do** keep compact Urbanist product names and let exact names wrap.
- **Do** preserve representative-image disclosure when photographed and selected capacities differ.
- **Do** retain keyboard tabs, native rails, carousel pause conditions and safe-area mobile separation.
- **Do** scope the storefront system away from owner tools.

### Don't:

- **Don't** add fabricated ratings, discounts, certifications, rankings, founder stories or commercial promises.
- **Don't** present a WhatsApp draft as a sent message, payment or confirmed order.
- **Don't** replace bottle photography with AI regeneration or geometric bottle substitutes.
- **Don't** reuse the superseded cobalt/Syne/ribbon world as the current storefront specification.
- **Don't** treat a source-based specification or an earlier screenshot review as final rendered approval.

Not canonized: page-specific campaign slogans, unused discount selectors and the smallest mobile metadata/utility dimensions are not reusable design primitives. They do not establish new brand rules; rendered legibility and clearance remain part of the independent finish review.
