const fs = require("node:fs");
const path = require("node:path");

// Next 15 vendors an older PostCSS beneath its package. The application already
// depends on a patched PostCSS, so remove the vulnerable nested copy and let
// Node resolve the patched root package instead.
//
// Safety: only delete if the path actually exists AND is inside node_modules
// (never follow symlinks outside the project).
const nestedPostcss = path.join(process.cwd(), "node_modules", "next", "node_modules", "postcss");
try {
  const real = fs.realpathSync(nestedPostcss);
  const expected = fs.realpathSync(path.join(process.cwd(), "node_modules"));
  if (real.startsWith(expected)) {
    fs.rmSync(nestedPostcss, { recursive: true, force: true });
  }
} catch {
  // Path doesn't exist — nothing to remove, that's fine.
}

const rootPkgPath = path.join(process.cwd(), "node_modules", "postcss", "package.json");
if (!fs.existsSync(rootPkgPath)) {
  console.warn("[harden-deps] root postcss not found — skipping version check");
  process.exit(0);
}

const rootVersion = require(rootPkgPath).version;
const [major, minor] = rootVersion.split(".").map(Number);
if (major < 8 || (major === 8 && minor < 5)) {
  throw new Error(`Patched PostCSS 8.5+ is required; found ${rootVersion}`);
}
console.log(`[harden-deps] using PostCSS ${rootVersion}`);
