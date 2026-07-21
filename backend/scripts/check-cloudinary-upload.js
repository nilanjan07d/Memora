const fs = require('fs');
const path = require('path');
require('dotenv').config();

const filePath = process.argv[2];

if (filePath && !fs.existsSync(filePath)) {
  console.error(`Image file not found: ${filePath}`);
  process.exit(1);
}

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('Cloudinary configuration is incomplete in .env.');
  process.exit(1);
}

const mimeTypes = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};
const isBuiltInTest = !filePath;
const contentType = isBuiltInTest
  ? 'image/png'
  : mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
const fileName = isBuiltInTest ? 'memora-cloudinary-test.png' : path.basename(filePath);
const fileContents = isBuiltInTest
  ? Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL3vwAAAABJRU5ErkJggg==', 'base64')
  : fs.readFileSync(filePath);

(async () => {
  const form = new FormData();
  form.append(
    'file',
    new Blob([fileContents], { type: contentType }),
    fileName
  );

  const authorization = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64');
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      headers: { Authorization: `Basic ${authorization}` },
      body: form,
    }
  );

  console.log(`Cloudinary response: ${response.status} ${response.statusText}`);
  console.log(await response.text());
})();
