// Convert black-on-white brand logo into transparent, recolored PNGs for dark UI.
// Uses luminance as alpha: dark artwork -> opaque, white bg/details -> transparent.
const sharp = require('sharp');

async function recolor(src, out, rgb) {
  // flatten any alpha onto white, trim surrounding whitespace
  const trimmed = await sharp(src).flatten({ background: '#ffffff' }).trim().png().toBuffer();
  const meta = await sharp(trimmed).metadata();
  // alpha mask: where artwork is dark -> opaque
  const mask = await sharp(trimmed).greyscale().negate().raw().toBuffer();
  await sharp({ create: { width: meta.width, height: meta.height, channels: 3, background: rgb } })
    .joinChannel(mask, { raw: { width: meta.width, height: meta.height, channels: 1 } })
    .png().toFile(out);
  console.log('wrote', out, meta.width + 'x' + meta.height);
}

(async () => {
  const GOLD = { r: 253, g: 185, b: 39 };
  const WHITE = { r: 247, g: 246, b: 251 };

  // mark only (gorilla + T) from File_001
  await recolor('images/gallery/File_001.png', 'images/logo-mark-gold.png', GOLD);
  await recolor('images/gallery/File_001.png', 'images/logo-mark-white.png', WHITE);
  // full logo with text from File_000
  await recolor('images/gallery/File_000.png', 'images/logo-full-white.png', WHITE);
  await recolor('images/gallery/File_000.png', 'images/logo-full-gold.png', GOLD);
  console.log('Done.');
})();
