/**
 * 存量图片/视频批量压缩脚本
 * 用法: node scripts/batchCompress.js
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const IMG_DIR = path.join(__dirname, '../uploads/images');
const VID_DIR = path.join(__dirname, '../uploads/videos');

const THUMBNAIL_SIZE = { width: 400 };
const MEDIUM_SIZE = { width: 1200 };
const MAX_SIZE = { width: 1920 };
const QUALITY = 80;

async function processImage(filepath, filename) {
  const name = path.parse(filename).name;
  const timestamp = Date.now();
  const ext = '.webp';

  const originalFile = `${name}_${timestamp}_orig${ext}`;
  const mediumFile = `${name}_${timestamp}_m${ext}`;
  const thumbnailFile = `${name}_${timestamp}_t${ext}`;

  const originalPath = path.join(IMG_DIR, originalFile);
  const mediumPath = path.join(IMG_DIR, mediumFile);
  const thumbnailPath = path.join(IMG_DIR, thumbnailFile);

  const buffer = fs.readFileSync(filepath);
  const meta = await sharp(buffer).metadata();
  const width = meta.width || 1920;

  await sharp(buffer).resize(THUMBNAIL_SIZE).webp({ quality: QUALITY }).toFile(thumbnailPath);
  await sharp(buffer).resize(MEDIUM_SIZE).webp({ quality: QUALITY }).toFile(mediumPath);

  if (width > MAX_SIZE.width) {
    await sharp(buffer).resize(MAX_SIZE).webp({ quality: QUALITY }).toFile(originalPath);
  } else {
    await sharp(buffer).webp({ quality: QUALITY }).toFile(originalPath);
  }

  const origSize = buffer.length;
  const newSizes = [originalFile, mediumFile, thumbnailFile].map(f => {
    return fs.statSync(path.join(IMG_DIR, f)).size;
  });

  return {
    original: `/uploads/images/${originalFile}`,
    medium: `/uploads/images/${mediumFile}`,
    thumbnail: `/uploads/images/${thumbnailFile}`,
    origSize,
    newSize: newSizes.reduce((a, b) => a + b, 0),
    origFile: filepath
  };
}

async function compressVideo(filepath, filename) {
  const name = path.parse(filename).name;
  const ext = path.extname(filename);
  const timestamp = Date.now();
  const compressedName = `${name}_${timestamp}_c${ext}`;
  const compressedPath = path.join(VID_DIR, compressedName);

  // 视频压缩：降低码率，分辨率限制在720p
  const cmd = `ffmpeg -i "${filepath}" -c:v libx264 -crf 28 -vf "scale=-2:720" -c:a aac -b:a 128k -y "${compressedPath}"`;

  const origSize = fs.statSync(filepath).size;
  await execAsync(cmd);

  const newSize = fs.statSync(compressedPath).size;

  // 生成缩略图
  const thumbName = `thumb_${timestamp}_${name}.jpg`;
  const thumbPath = path.join(VID_DIR, thumbName);
  await execAsync(`ffmpeg -i "${compressedPath}" -ss 00:00:01 -vframes 1 -vf "scale=400:-1" -y "${thumbPath}"`);

  return {
    original: `/uploads/videos/${compressedName}`,
    thumbnail: `/uploads/videos/${thumbName}`,
    origSize,
    newSize,
    origFile: filepath
  };
}

async function main() {
  console.log('=== 批量压缩开始 ===\n');

  // 处理图片
  const imgFiles = fs.readdirSync(IMG_DIR).filter(f =>
    /\.(jpg|jpeg|png|gif|bmp)$/i.test(f)
  );
  console.log(`图片数量: ${imgFiles.length}`);

  let totalOrigImg = 0, totalNewImg = 0;
  for (const file of imgFiles) {
    const filepath = path.join(IMG_DIR, file);
    const origSize = fs.statSync(filepath).size;
    totalOrigImg += origSize;
    try {
      const r = await processImage(filepath, file);
      const saved = ((1 - r.newSize / r.origSize) * 100).toFixed(1);
      console.log(`  [压缩] ${file}: ${(origSize/1024).toFixed(0)}KB → ${(r.newSize/1024).toFixed(0)}KB (节省 ${saved}%)`);
      // 替换：在原位置留压缩版本，删除原文件
      fs.unlinkSync(r.origFile);
      totalNewImg += r.newSize;
    } catch (e) {
      console.log(`  [跳过] ${file}: ${e.message}`);
      totalNewImg += origSize;
    }
  }
  console.log(`图片总计: ${(totalOrigImg/1024/1024).toFixed(1)}MB → ${(totalNewImg/1024/1024).toFixed(1)}MB (节省 ${((1-totalNewImg/totalOrigImg)*100).toFixed(1)}%)\n`);

  // 处理视频
  const vidFiles = fs.readdirSync(VID_DIR).filter(f =>
    /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(f)
  );
  console.log(`视频数量: ${vidFiles.length}`);

  let totalOrigVid = 0, totalNewVid = 0;
  for (const file of vidFiles) {
    const filepath = path.join(VID_DIR, file);
    const origSize = fs.statSync(filepath).size;
    totalOrigVid += origSize;
    try {
      const r = await compressVideo(filepath, file);
      const saved = ((1 - r.newSize / r.origSize) * 100).toFixed(1);
      console.log(`  [压缩] ${file}: ${(origSize/1024/1024).toFixed(1)}MB → ${(r.newSize/1024/1024).toFixed(1)}MB (节省 ${saved}%)`);
      fs.unlinkSync(r.origFile);
      totalNewVid += r.newSize;
    } catch (e) {
      console.log(`  [跳过] ${file}: ${e.message}`);
      totalNewVid += origSize;
    }
  }
  console.log(`视频总计: ${(totalOrigVid/1024/1024).toFixed(1)}MB → ${(totalNewVid/1024/1024).toFixed(1)}MB (节省 ${((1-totalNewVid/totalOrigVid)*100).toFixed(1)}%)\n`);

  console.log('=== 批量压缩完成 ===');
  console.log(`总存量: ${((totalOrigImg+totalOrigVid)/1024/1024).toFixed(1)}MB → ${((totalNewImg+totalNewVid)/1024/1024).toFixed(1)}MB`);
}

main().catch(console.error);
