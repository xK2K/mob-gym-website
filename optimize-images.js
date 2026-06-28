// Compress gallery/shop images: resize + WebP + optimized JPG fallback
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dirs = ['images/gallery', 'images/shop'];

(async () => {
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png)$/i.test(f) && !f.includes('.min.'));
    for (const file of files) {
      const src = path.join(dir, file);
      const base = file.replace(/\.(jpe?g|png)$/i, '');
      const before = (fs.statSync(src).size / 1048576).toFixed(2);

      // optimized JPG (overwrite original name)
      const jpgBuf = await sharp(src).rotate()
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 78, mozjpeg: true }).toBuffer();

      // WebP version
      await sharp(src).rotate()
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 75 }).toFile(path.join(dir, base + '.webp'));

      const tmp = path.join(dir, base + '.tmp');
      fs.writeFileSync(tmp, jpgBuf);
      try { fs.rmSync(src); } catch (e) {}
      fs.renameSync(tmp, src);
      const after = (fs.statSync(src).size / 1048576).toFixed(2);
      console.log(`${file}: ${before}MB -> ${after}MB (+ ${base}.webp)`);
    }
  }
  console.log('Done.');
})();
