/**
 * 视频批量压缩（单进程，省内存）
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const VID_DIR = path.join(__dirname, '../uploads/videos');

const vidFiles = fs.readdirSync(VID_DIR).filter(f =>
  /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(f) && !f.includes('_c.mp4') && !f.startsWith('thumb_')
);

console.log(`视频数量: ${vidFiles.length}`);
let totalOrig = 0, totalNew = 0;

for (const file of vidFiles) {
  const filepath = path.join(VID_DIR, file);
  const origSize = fs.statSync(filepath).size;
  totalOrig += origSize;

  const name = path.parse(file).name;
  const compressedName = `${name}_c.mp4`;
  const compressedPath = path.join(VID_DIR, compressedName);
  const thumbName = `thumb_${name}.jpg`;
  const thumbPath = path.join(VID_DIR, thumbName);

  console.log(`[处理] ${file} (${(origSize/1024/1024).toFixed(1)}MB)`);

  try {
    // 压缩：CRF 30（更小体积），720p，使用轻量预设
    execSync(
      `ffmpeg -i "${filepath}" -c:v libx264 -preset ultrafast -crf 30 -vf "scale=-2:720" -c:a aac -b:a 96k -y "${compressedPath}"`,
      { maxBuffer: 50 * 1024 * 1024 }
    );

    // 生成缩略图
    execSync(
      `ffmpeg -i "${compressedPath}" -ss 00:00:01 -vframes 1 -vf "scale=400:-1" -y "${thumbPath}"`,
      { maxBuffer: 10 * 1024 * 1024 }
    );

    const newSize = fs.statSync(compressedPath).size;
    totalNew += newSize;
    const saved = ((1 - newSize / origSize) * 100).toFixed(1);
    console.log(`  -> ${compressedName} (${(newSize/1024/1024).toFixed(1)}MB, 节省 ${saved}%)`);

    // 删除原文件
    fs.unlinkSync(filepath);
  } catch (e) {
    console.log(`  [跳过] ${file}: ${e.message}`);
    totalNew += origSize;
  }
}

console.log(`\n视频总计: ${(totalOrig/1024/1024).toFixed(1)}MB -> ${(totalNew/1024/1024).toFixed(1)}MB`);
console.log(`节省: ${((1-totalNew/totalOrig)*100).toFixed(1)}%`);
