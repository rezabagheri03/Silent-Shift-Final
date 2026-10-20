/**
 * Intrinsic sizes for the bundled art. Card crops use these to reserve the
 * right aspect ratio; `-480`/`-960` WebP variants exist for design art.
 */
const DIMENSIONS: Record<string, [number, number]> = {
  "/Logo.svg": [1520, 1520],
  "/images/hero.webp": [1280, 698],
  "/brand/barzo.jpg": [800, 720],
  "/design/article-grid.webp": [1440, 785],
  "/design/article-stage.webp": [512, 512],
  "/design/coast.webp": [1440, 785],
  "/design/contact-hero.webp": [1920, 815],
  "/design/dunes-alt.webp": [1440, 785],
  "/design/dunes.webp": [1440, 785],
  "/design/feature-fog.webp": [1440, 804],
  "/design/fog-path.webp": [1440, 785],
  "/design/gold-folds.webp": [1440, 785],
  "/design/gold-line.webp": [1440, 785],
  "/design/hero.webp": [1920, 1047],
  "/design/not-found.webp": [1920, 815],
  "/design/podcast-cover.webp": [1024, 1024],
  "/design/profile.webp": [572, 515],
  "/design/ripple-stone-alt.webp": [1440, 785],
  "/design/ripple-stone.webp": [1440, 785],
  "/design/ripple.webp": [1408, 768],
  "/design/web-thread.webp": [1440, 1040],
};

export function imageDimensions(src: string): [number, number] {
  return DIMENSIONS[src] ?? [1440, 785];
}

/** Responsive candidates for the 1440px design art; uploads fall back to the source. */
export function designSrcSet(src: string): string | undefined {
  const match = /^\/design\/([a-z0-9-]+)\.webp$/.exec(src);
  if (!match) return undefined;
  const [width] = imageDimensions(src);
  if (width < 960) return undefined;
  const base = `/design/${match[1]}`;
  return `${base}-480.webp 480w, ${base}-960.webp 960w, ${src} ${width}w`;
}
