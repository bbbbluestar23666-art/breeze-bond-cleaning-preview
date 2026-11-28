# Breeze Bond Cleaning private concept
No production WordPress changes. No booking, payment, tracking or data submission.
## Structure
dist/config.js: draft rates, approval policy, quantities.
dist/quote-engine.js: deterministic estimate and formatting.
dist/content.js: reviewable FAQ drafts.
dist/app.js: UI and preparation checklist.
dist/style.css: Metropolis and #262262 sourced from existing Breeze.
Run node test.cjs for domain checks. Static dist needs no package installation.
## Before public launch
Resolve internal prices against approved customer tariff and existing Terms (GST, carpet discrepancy, house adjustment, shutters). Confirm all service policies. Move pricing authority to server. Add WordPress plugin/shortcode adapter and scope styles to its container; do not paste this entire page into Elementor.
Preserve config version/history. Estimate is not a confirmed quote. Unknown prices remain null. No bond probability or guarantee.
