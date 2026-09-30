# Vaidora application

Next.js App Router, TypeScript, React and Tailwind. Node server required for Sharp image rendering. Prisma models keep fragrances separate from variants. The checked-in schema and Docker Compose use PostgreSQL only.

Authenticated server route handlers validate all writes. Admin sessions are HttpOnly, signed and expiring. Same-origin checks protect state changes; credentials remain environment-only. Stock is descriptive because sales are completed on WhatsApp, not reserved by an enquiry.

Template exports always start from original masters. The editor shares text-fitting layout with the server. Bulk generation previews a saved plan, then creates grouped products and variants transactionally per fragrance, with database progress and explicit error reporting. Names become safe, collision-checked slugs; server paths are constrained to managed directories.

The user requested a custom Node/PostgreSQL/Sharp application. It needs a persistent Node host and database; a static/edge-only Site deployment cannot execute the image compositor as specified.

The web service and worker share persistent master/upload/product directories. Versioned exports are served by /media, including files created after startup. Back up image storage and PostgreSQL together. Native dialogs provide focus trapping; CSS handles entry/exit, native scroll-snap moves product rows, and Motion animates the collection underline. Campaign autoplay pauses on hover/focus/document hiding and respects reduced motion.
