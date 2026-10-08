import * as fs from 'fs';
import * as path from 'path';

export function createDummyPng(width = 256, height = 256): Buffer {
  // Minimal valid 1x1 or raw PNG buffer
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 72, 13, 10, 26, 10]);
  // IHDR chunk: 1x1 RGBA
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdr = createChunk('IHDR', ihdrData);
  // Simple IDAT with uncompressed deflate block
  const rawPixel = Buffer.from([0, 34, 197, 94, 255]); // filter byte + RGBA
  const zlibHeader = Buffer.from([0x78, 0x01, 0x01, 0x05, 0x00, 0xfa, 0xff]);
  const adler32 = Buffer.from([0x03, 0xd0, 0x01, 0x76]);
  const idatData = Buffer.concat([zlibHeader, rawPixel, adler32]);
  const idat = createChunk('IDAT', idatData);
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); // crc placeholder
  return Buffer.concat([len, typeBuf, data, crc]);
}

export function createDummyBmp(): Buffer {
  // 164x314 standard NSIS sidebar BMP header (54 bytes) + pixel data
  const fileSize = 54 + 164 * 314 * 3;
  const buf = Buffer.alloc(fileSize, 0);
  buf.write('BM', 0);
  buf.writeUInt32LE(fileSize, 2);
  buf.writeUInt32LE(54, 10); // offset
  buf.writeUInt32LE(40, 14); // header size
  buf.writeInt32LE(164, 18); // width
  buf.writeInt32LE(314, 22); // height
  buf.writeUInt16LE(1, 26);  // planes
  buf.writeUInt16LE(24, 28); // bpp
  return buf;
}

export function createDummyIco(): Buffer {
  // ICO header: 6 bytes
  const header = Buffer.from([0, 0, 1, 0, 1, 0]); // 1 image
  const png = createDummyPng(32, 32);
  const entry = Buffer.alloc(16);
  entry[0] = 32; // width
  entry[1] = 32; // height
  entry[2] = 0;  // colors
  entry[3] = 0;  // reserved
  entry.writeUInt16LE(1, 4);  // color planes
  entry.writeUInt16LE(32, 6); // bpp
  entry.writeUInt32LE(png.length, 8); // size
  entry.writeUInt32LE(22, 12); // offset (6 + 16 = 22)
  return Buffer.concat([header, entry, png]);
}

function main() {
  const resourcesDir = path.join(__dirname, '../resources');
  if (!fs.existsSync(resourcesDir)) fs.mkdirSync(resourcesDir, { recursive: true });

  fs.writeFileSync(path.join(resourcesDir, 'icon.png'), createDummyPng(256, 256));
  fs.writeFileSync(path.join(resourcesDir, 'icon.ico'), createDummyIco());
  fs.writeFileSync(path.join(resourcesDir, 'installerSidebar.bmp'), createDummyBmp());

  const fontsDir = path.join(__dirname, '../src/renderer/assets/fonts');
  if (!fs.existsSync(fontsDir)) fs.mkdirSync(fontsDir, { recursive: true });

  // Minimal font file placeholders if not present
  const fontInter = path.join(fontsDir, 'Inter-Variable.woff2');
  const fontNoto = path.join(fontsDir, 'NotoSansArabic-Variable.woff2');
  if (!fs.existsSync(fontInter)) fs.writeFileSync(fontInter, Buffer.alloc(32));
  if (!fs.existsSync(fontNoto)) fs.writeFileSync(fontNoto, Buffer.alloc(32));

  console.log('Generated app icons, resources, and font assets successfully.');
}

if (require.main === module) {
  main();
}
