const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '../uploads/images');

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// 图片压缩配置
const THUMBNAIL_SIZE = { width: 400 };
const MEDIUM_SIZE = { width: 1200 };
const MAX_SIZE = { width: 1920 };
const QUALITY = 80;

/**
 * 处理并压缩上传的图片
 * @param {Buffer} buffer - 原始图片数据
 * @param {string} filename - 原始文件名
 * @returns {Promise<{filename: string, thumbnail: string, medium: string, original: string}>}
 */
async function processImage(buffer, filename) {
  const name = path.parse(filename).name;
  const ext = '.webp'; // 统一转 webp，体积小质量高
  const timestamp = Date.now();

  const originalFile = `${name}_${timestamp}_orig${ext}`;
  const mediumFile = `${name}_${timestamp}_m${ext}`;
  const thumbnailFile = `${name}_${timestamp}_t${ext}`;

  const originalPath = path.join(UPLOAD_DIR, originalFile);
  const mediumPath = path.join(UPLOAD_DIR, mediumFile);
  const thumbnailPath = path.join(UPLOAD_DIR, thumbnailFile);

  const pipeline = sharp(buffer);

  // 获取元数据
  const meta = await pipeline.metadata();
  const width = meta.width || 1920;

  // 生成缩略图（固定宽400，保持比例）
  await sharp(buffer)
    .resize(THUMBNAIL_SIZE)
    .webp({ quality: QUALITY })
    .toFile(thumbnailPath);

  // 生成中等尺寸（最大宽1200）
  await sharp(buffer)
    .resize(MEDIUM_SIZE)
    .webp({ quality: QUALITY })
    .toFile(mediumPath);

  // 原图压缩（最大宽1920，仅过大时缩放）
  if (width > MAX_SIZE.width) {
    await sharp(buffer)
      .resize(MAX_SIZE)
      .webp({ quality: QUALITY })
      .toFile(originalPath);
  } else {
    await sharp(buffer)
      .webp({ quality: QUALITY })
      .toFile(originalPath);
  }

  return {
    original: `/uploads/images/${originalFile}`,
    medium: `/uploads/images/${mediumFile}`,
    thumbnail: `/uploads/images/${thumbnailFile}`,
    width: meta.width,
    height: meta.height
  };
}

/**
 * 删除处理后的图片（一组三个）
 */
async function deleteImages(imagePaths) {
  for (const p of imagePaths) {
    if (!p) continue;
    const filePath = path.join(__dirname, '..', p);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {}
  }
}

module.exports = { processImage, deleteImages, UPLOAD_DIR };
