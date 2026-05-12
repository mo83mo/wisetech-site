// scripts/generate-favicons.mjs
import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('public/images', { recursive: true });

const input = 'C:/Users/muham/OneDrive/Desktop/WiseTech IT Logo/New Site/Wisetech-logo-Final-White.png';

// 32x32 PNG
await sharp(input)
  .resize(32, 32, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
  .png()
  .toFile('public/images/favicon-32.png');

// 180x180 PNG (Apple touch icon)
await sharp(input)
  .resize(180, 180, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
  .png()
  .toFile('public/images/favicon-180.png');

// 48x48 for favicon.ico (save as PNG, browsers accept it)
await sharp(input)
  .resize(48, 48, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
  .png()
  .toFile('public/favicon.ico');

console.log('Favicons generated successfully');
