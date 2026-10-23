// Turn downloaded originals into responsive WebP variants + a manifest.
// Usage: node scripts/process-images.mjs <download-dir> [<extra-map.json>]
// The download dir holds log.json ({ url: { ok, file } }) written by the migration downloader.
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

const [, , dlDir, extraMapPath] = process.argv;
if (!dlDir) throw new Error("usage: process-images.mjs <download-dir>");

const OUT_DIR = "public/img";
const MANIFEST = "src/content/images.json";
const WIDTHS = [480, 960, 1600];

await fs.mkdir(OUT_DIR, { recursive: true });
const log = JSON.parse(await fs.readFile(path.join(dlDir, "log.json"), "utf8"));
const extra = extraMapPath ? JSON.parse(await fs.readFile(extraMapPath, "utf8")) : {};
let manifest = {};
try {
  manifest = JSON.parse(await fs.readFile(MANIFEST, "utf8"));
} catch {}

const jobs = [
  ...Object.entries(log).filter(([, v]) => v.ok).map(([url, v]) => [url, path.join(dlDir, v.file)]),
  ...Object.entries(extra),
];

let done = 0;
for (const [url, file] of jobs) {
  const id = crypto.createHash("sha1").update(url).digest("hex").slice(0, 12);
  if (manifest[url]?.id === id) {
    done++;
    continue;
  }
  try {
    const img = sharp(file, { failOn: "error", limitInputPixels: 60_000_000 }).rotate();
    const meta = await img.metadata();
    const w0 = meta.autoOrient?.width ?? meta.width;
    const h0 = meta.autoOrient?.height ?? meta.height;
    const widths = WIDTHS.filter((w) => w < w0);
    if (!widths.length || w0 <= 1700) widths.push(Math.min(w0, 1600));
    const uniq = [...new Set(widths)].sort((a, b) => a - b);
    for (const w of uniq) {
      await img
        .clone()
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: w >= 1200 ? 68 : 72, effort: 5 })
        .toFile(path.join(OUT_DIR, `${id}-${w}.webp`));
    }
    const blurBuf = await img.clone().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
    const top = uniq[uniq.length - 1];
    manifest[url] = {
      id,
      w: top,
      h: Math.round((h0 / w0) * top),
      widths: uniq,
      blur: `data:image/webp;base64,${blurBuf.toString("base64")}`,
    };
  } catch (e) {
    console.warn("skip", url, e.message);
  }
  if (++done % 50 === 0) {
    console.log(done, "/", jobs.length);
    await fs.writeFile(MANIFEST, JSON.stringify(manifest));
  }
}
await fs.writeFile(MANIFEST, JSON.stringify(manifest));
console.log("images:", Object.keys(manifest).length);
