# Design Asset Integration

The assets supplied at the repository root are now integrated into the Next.js application.

## Typography

The site uses the licensed **IRANYekanXFaNum** family with Persian numerals. The four weights used by the design system are copied to `public/fonts/`:

- `IRANYekanXFaNum-Regular.woff2` — 400
- `IRANYekanXFaNum-Medium.woff2` — 500
- `IRANYekanXFaNum-DemiBold.woff2` — 600
- `IRANYekanXFaNum-Bold.woff2` — 700

They are registered with `@font-face` at the beginning of `app/globals.css`. Tailwind's `font-sans` token points to `IRANYekanXFaNum`. There is no Google Fonts runtime dependency.

## Podcast platform marks

The supplied vector files are available as:

- `public/brand/apple-podcasts.svg`
- `public/brand/castbox.svg`

`components/sections/PlatformBadges.tsx` is the shared implementation used by the landing page and podcast pages.

## Design imagery

The raster imagery embedded inside the supplied Figma SVG exports was extracted, deduplicated, resized, and encoded as WebP under `public/design/`. Semantic filenames are used instead of the original generated hashes.

Key assets:

| Asset | Usage |
|---|---|
| `hero.webp` | Landing hero |
| `profile.webp` | Barzoo portrait with transparent background |
| `podcast-cover.webp` | Default episode artwork |
| `feature-fog.webp` | Article listing hero |
| `ripple.webp` | Podcast listing/detail hero |
| `article-stage.webp` | Default article detail cover |
| `article-grid.webp` | Article body visual |
| `contact-hero.webp` | Contact hero |
| `not-found.webp` | 404 page |
| `ripple-stone.webp`, `gold-line.webp`, `dunes.webp`, etc. | Editorial card fallbacks |

`lib/design-assets.ts` centralizes these paths and provides deterministic fallback covers. CMS-uploaded `cover_url` values always take precedence.

## Replacing an asset

Keep the same public filename to replace an image without code changes. For a new filename, update `lib/design-assets.ts` or the relevant shared section component. Run the following after changes:

```bash
npm run build
```
