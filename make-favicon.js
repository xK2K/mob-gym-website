// Build favicons: gold gorilla mark centered on a dark brand square.
const sharp = require('sharp');

async function make(size, pad) {
  const inner = Math.round(size * pad);
  const mark = await sharp('images/logo-mark-gold.png')
    .resize({ width: inner, height: inner, fit: 'inside' })
    .toBuffer();
  const m = await sharp(mark).metadata();
  return sharp({ create: { width: size, height: size, channels: 4, background: { r: 10, g: 10, b: 15, alpha: 1 } } })
    .composite([{ input: mark, left: Math.round((size - m.width) / 2), top: Math.round((size - m.height) / 2) }])
    .png();
}

(async () => {
  await (await make(32, 0.78)).toFile('images/favicon-32.png');
  await (await make(180, 0.72)).toFile('images/favicon-180.png');
  await (await make(512, 0.66)).toFile('images/favicon-512.png');
  console.log('Favicons created: 32, 180, 512');
})();
