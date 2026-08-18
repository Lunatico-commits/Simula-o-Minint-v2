const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function run() {
  const publicDir = path.join(__dirname, '..', 'public');
  const svgPath = path.join(publicDir, 'icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  const targets = [
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-precomposed.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
  ];

  console.log('Generating PNG icons from SVG...');
  for (const target of targets) {
    const outPath = path.join(publicDir, target.name);
    await sharp(svgBuffer)
      .resize(target.size, target.size)
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outPath);
    console.log(`✓ Generated ${target.name} (${target.size}x${target.size})`);
  }

  // Create standard multi-resolution ICO file (or 48x48 PNG embedded ICO)
  // ICO header format with standard 48x48 and 32x32 and 16x16 PNG chunks
  const png48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();

  const images = [
    { width: 48, height: 48, data: png48 },
    { width: 32, height: 32, data: png32 },
    { width: 16, height: 16, data: png16 },
  ];

  // Build basic ICO container buffer
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // reserved
  icoHeader.writeUInt16LE(1, 2); // image type: 1 = ICO
  icoHeader.writeUInt16LE(images.length, 4); // count

  let offset = 6 + (images.length * 16);
  const dirEntries = [];
  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.data.length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset
    dirEntries.push(entry);
    offset += img.data.length;
  }

  const icoBuffer = Buffer.concat([
    icoHeader,
    ...dirEntries,
    ...images.map(img => img.data),
  ]);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('✓ Generated favicon.ico (multi-res 16/32/48)');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
