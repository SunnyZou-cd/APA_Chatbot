# Changelog

## 1.6.0 - 2026-06-20

### Changed

- Rebuilt the full APA Coach interface around the `#12372A`, `#436850`, `#ADBC9F`, and `#FBFADA` palette.
- Added a web-based Liquid Glass visual system with solid-color fallbacks for reduced transparency and unsupported browsers.
- Added a collapsible desktop sidebar with session-independent local preference storage.
- Added an automatic compact navigation rail for medium screens and a fixed bottom navigation bar for mobile screens.
- Restyled Build, Document Check, Learn, Faculty Review, forms, result panels, feedback states, and loading controls.
- Added reduced-motion behavior, stronger focus indicators, a skip link, and clearer active-navigation semantics.
- Updated the page title, description, theme color, favicon, and crawler metadata.

### Preserved

- Kept the existing citation, document-analysis, upload, BYOK, and Vercel API behavior unchanged.
- Kept the learning-tool boundary: APA Coach provides teaching feedback and does not claim final APA validation.

### Validation

- 117 automated tests passed.
- TypeScript client and Vercel API builds passed.
- Dependency audit reported zero vulnerabilities.
- Lighthouse scored 100 for Performance, Accessibility, Best Practices, and SEO; measured LCP was 1.4 seconds and CLS was 0.

Earlier release notes remain available under [`public/docs`](public/docs).
