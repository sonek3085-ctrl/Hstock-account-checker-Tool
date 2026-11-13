const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, bgColor = [11, 12, 16], fgColor = [254, 44, 85]) {
  // Simple uncompressed or deflated raw RGBA bitmap
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.38;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter byte: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        // Inner icon circle / gradient
        const t = (x + y) / (width + height);
        rawData[pxOffset] = Math.round(fgColor[0] * (1 - t) + 37 * t);     // R
        rawData[pxOffset + 1] = Math.round(fgColor[1] * (1 - t) + 244 * t); // G
        rawData[pxOffset + 2] = Math.round(fgColor[2] * (1 - t) + 238 * t); // B
        rawData[pxOffset + 3] = 255;
      } else {
        rawData[pxOffset] = bgColor[0];
        rawData[pxOffset + 1] = bgColor[1];
        rawData[pxOffset + 2] = bgColor[2];
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // Basic CRC32 table
  function crc32(buf) {
    let c = 0xffffffff;
    for (let n = 0; n < buf.length; n++) {
      c = (c ^ buf[n]) >>> 0;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. 192x192 PNG
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192));
console.log('Created pwa-192x192.png');

// 2. 512x512 PNG
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512));
console.log('Created pwa-512x512.png');

// 3. Maskable 512x512 with safe zone
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, [11, 12, 16], [37, 244, 238]));
console.log('Created pwa-maskable-512x512.png');

// 4. Apple Touch Icon 180x180
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180));
console.log('Created apple-touch-icon.png');
