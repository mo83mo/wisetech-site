// scripts/generate-transparent-logo.mjs
// Creates a transparent-background version of the logo for use on white/light backgrounds.
import sharp from 'sharp';

const input = 'C:/Users/muham/OneDrive/Desktop/WiseTech IT Logo/New Site/Wisetech-logo-LinkedIn.png';

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

// Remove near-white background pixels (make them transparent)
for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  if (r > 235 && g > 235 && b > 235) {
    data[i + 3] = 0; // transparent
  }
}

await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 }
})
  .png()
  .toFile('public/images/logo-transparent.png');

console.log('Transparent logo saved to public/images/logo-transparent.png');
