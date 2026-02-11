import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

function readPngSize(pngBuffer) {
  // PNG signature (8) + IHDR length (4) + "IHDR" (4) = 16 bytes, then width/height (8).
  if (pngBuffer.length < 24) throw new Error('Invalid PNG (too small)');

  const signature = pngBuffer.subarray(0, 8);
  const expected = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!signature.equals(expected)) throw new Error('Invalid PNG signature');

  const chunkType = pngBuffer.subarray(12, 16).toString('ascii');
  if (chunkType !== 'IHDR') throw new Error('Invalid PNG (missing IHDR)');

  const width = pngBuffer.readUInt32BE(16);
  const height = pngBuffer.readUInt32BE(20);
  return {width, height};
}

function renderSvgToPng(svgPath, size) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'apostrofe-icon-'));
  try {
    execFileSync(
      'qlmanage',
      ['-t', '-s', String(size), '-o', tempDir, svgPath],
      {stdio: 'ignore'}
    );

    // qlmanage output name convention: "<basename>.<ext>.png" (e.g. icon.svg.png)
    const pngPath = path.join(tempDir, `${path.basename(svgPath)}.png`);
    const pngBuffer = fs.readFileSync(pngPath);
    const dims = readPngSize(pngBuffer);
    return {pngBuffer, ...dims};
  } finally {
    fs.rmSync(tempDir, {recursive: true, force: true});
  }
}

function buildIco(pngImages) {
  const count = pngImages.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = icon
  header.writeUInt16LE(count, 4);

  const entries = Buffer.alloc(16 * count);

  let offset = 6 + entries.length;
  const payloads = [];

  pngImages.forEach(({pngBuffer, width, height}, index) => {
    const entryOffset = index * 16;
    entries.writeUInt8(width >= 256 ? 0 : width, entryOffset + 0);
    entries.writeUInt8(height >= 256 ? 0 : height, entryOffset + 1);
    entries.writeUInt8(0, entryOffset + 2); // palette
    entries.writeUInt8(0, entryOffset + 3); // reserved
    entries.writeUInt16LE(1, entryOffset + 4); // planes
    entries.writeUInt16LE(32, entryOffset + 6); // bpp
    entries.writeUInt32LE(pngBuffer.length, entryOffset + 8);
    entries.writeUInt32LE(offset, entryOffset + 12);

    payloads.push(pngBuffer);
    offset += pngBuffer.length;
  });

  return Buffer.concat([header, entries, ...payloads]);
}

function main() {
  const repoRoot = process.cwd();
  const svgPath = path.join(repoRoot, 'src', 'app', 'icon.svg');
  const outPath = path.join(repoRoot, 'src', 'app', 'favicon.ico');

  if (!fs.existsSync(svgPath)) {
    console.error(`[icons] Missing source icon: ${path.relative(repoRoot, svgPath)}`);
    process.exitCode = 1;
    return;
  }

  // macOS-only renderer; we commit the resulting .ico so CI/build doesn't need this.
  const png16 = renderSvgToPng(svgPath, 16);
  const png32 = renderSvgToPng(svgPath, 32);

  const ico = buildIco([png16, png32]);
  fs.writeFileSync(outPath, ico);
  console.log(
    `[icons] Wrote ${path.relative(repoRoot, outPath)} from ${path.relative(
      repoRoot,
      svgPath
    )} (${png16.width}x${png16.height}, ${png32.width}x${png32.height})`
  );
}

main();
