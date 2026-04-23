const multer = require('multer');
const path = require('path');
const fs = require('fs');
const iconv = require('iconv-lite');

// 将被误读为Latin-1的UTF-8文件名还原
function fixFilename(filename) {
  if (!filename) return filename;
  try {
    if (/[一-龥]/.test(filename)) return filename;
    const restored = iconv.decode(Buffer.from(filename, 'latin1'), 'utf8');
    if (/[一-龥]/.test(restored)) return restored;
  } catch (e) {}
  return filename;
}

const uploadDir = path.join(__dirname, '../uploads');
['images', 'videos'].forEach(dir => {
  const fullPath = path.join(uploadDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

function makeFilename(originalName, destDir) {
  const ext = path.extname(originalName);
  const base = fixFilename(originalName).substring(0, fixFilename(originalName).length - ext.length).replace(/[\/\:*?"<>|]/g, '_');
  let filename = base + ext;
  // 如果文件名不冲突，直接用原名
  if (!fs.existsSync(path.join(destDir, filename))) return filename;
  // 冲突时加时间戳
  filename = base + '-' + Date.now() + ext;
  // 再冲突就加随机数
  let counter = 1;
  while (fs.existsSync(path.join(destDir, filename)) && counter < 100) {
    filename = base + '-' + Date.now() + '-' + counter + ext;
    counter++;
  }
  return filename;
}

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(uploadDir, 'images')),
  filename: (req, file, cb) => {
    const destDir = path.join(uploadDir, 'images');
    const filename = makeFilename(file.originalname, destDir);
    cb(null, filename);
  }
});

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(uploadDir, 'videos')),
  filename: (req, file, cb) => {
    const destDir = path.join(uploadDir, 'videos');
    const filename = makeFilename(file.originalname, destDir);
    cb(null, filename);
  }
});

const imageFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('只支持 JPG、PNG、GIF、WebP 格式图片'), false);
};

const videoFilter = (req, file, cb) => {
  const allowed = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('只支持 MP4、WebM、OGG、MOV 等格式视频'), false);
};

const uploadImage = multer({ storage: imageStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 * 1024 } });
const uploadVideo = multer({ storage: videoStorage, fileFilter: videoFilter, limits: { fileSize: 5 * 1024 * 1024 * 1024 } });

module.exports = { uploadImage, uploadVideo };
