const { spawnSync, spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const root = process.cwd();

// Load .env file if present (simple parser, no dependencies)
const envPath = path.join(root, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

// AUTH_SECRET, ADMIN_USERNAME, and ADMIN_PASSWORD are required in ALL environments.
const secret = process.env.AUTH_SECRET || "";
if (secret.length < 32) {
  throw new Error("AUTH_SECRET must be configured with at least 32 characters");
}
if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 12) {
  throw new Error("ADMIN_USERNAME and a 12+ character ADMIN_PASSWORD are required");
}

const defaultData = path.join(root, "data");
const defaultUploads = path.join(root, "public", "uploads");
const dataDir = path.resolve(process.env.DATA_DIR || defaultData);
const uploadDir = path.resolve(process.env.UPLOAD_DIR || defaultUploads);

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(path.join(uploadDir, "covers"), { recursive: true });
fs.mkdirSync(path.join(uploadDir, "audio"), { recursive: true });

if (uploadDir !== defaultUploads) {
  fs.rmSync(defaultUploads, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(defaultUploads), { recursive: true });
  fs.symlinkSync(uploadDir, defaultUploads, "dir");
}

console.log("[start] running seed (idempotent)…");
const seed = spawnSync("npx", ["tsx", "scripts/seed.ts"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});
if (seed.status !== 0) {
  console.error("[start] seed failed with code", seed.status);
  process.exit(seed.status || 1);
}

console.log("[start] starting next…");
const next = spawn(
  "npx",
  ["next", "start", "-p", process.env.PORT || "3000", "-H", "0.0.0.0"],
  { stdio: "inherit", env: process.env, shell: process.platform === "win32" }
);
next.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => next.kill(signal));
