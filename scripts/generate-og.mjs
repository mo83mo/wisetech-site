// scripts/generate-og.mjs
import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('public/images', { recursive: true });

const logoBuffer = await sharp(
  'C:/Users/muham/OneDrive/Desktop/WiseTech IT Logo/Wisetech-logo-Final-White.png'
)
  .resize(500, null, { fit: 'inside' })
  .toBuffer();

await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 4,
    background: { r: 15, g: 23, b: 42, alpha: 1 },
  },
})
  .composite([{ input: logoBuffer, gravity: 'centre' }])
  .jpeg({ quality: 90 })
  .toFile('public/images/og-default.jpg');

console.log('OG image generated successfully');
