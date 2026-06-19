#!/usr/bin/env node
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT, "dist");

const FILES = ["index.html", "styles.css", "script.js", "robots.txt", "sitemap.xml", "feed.xml", "site.webmanifest"];
const DIRS = ["articles"];
const EXCLUDED_ASSETS = new Set(["ogp-work.png"]);

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  await rm(DIST_DIR, { recursive: true, force: true });
  await mkdir(path.join(DIST_DIR, "data"), { recursive: true });

  await Promise.all(FILES.map((file) => cp(path.join(ROOT, file), path.join(DIST_DIR, file))));
  await Promise.all(DIRS.map((dir) => cp(path.join(ROOT, dir), path.join(DIST_DIR, dir), { recursive: true })));
  await cp(path.join(ROOT, "assets"), path.join(DIST_DIR, "assets"), {
    recursive: true,
    filter: (src) => !EXCLUDED_ASSETS.has(path.basename(src)),
  });
  await cp(path.join(ROOT, "data", "articles.generated.js"), path.join(DIST_DIR, "data", "articles.generated.js"));

  console.log(`Prepared upload files: ${path.relative(ROOT, DIST_DIR)}`);
}
