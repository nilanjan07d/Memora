const fs = require('fs/promises');
const cloudinary = require('../config/cloudinary');

const removeTemporaryFile = async (file) => {
  if (!file?.path) return;
  try { await fs.unlink(file.path); } catch (error) {
    if (error.code !== 'ENOENT') console.error('Temporary upload cleanup failed:', error.message);
  }
};

const destroyCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  try { await cloudinary.uploader.destroy(publicId, { resource_type: 'image' }); }
  catch (error) { console.error('Cloudinary cleanup failed:', error.message); }
};

module.exports = { removeTemporaryFile, destroyCloudinaryImage };
