const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { uploadImage, uploadVideo } = require('../middleware/upload');
const pool = require('../db');
const { processImage, deleteImages } = require('../utils/imageProcessor');

const videoDir = path.join(__dirname, '../uploads/videos');
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

// 上传图片（压缩 + 生成缩略图/中等图）
router.post('/image', uploadImage.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择图片文件' });
    }

    const buffer = fs.readFileSync(req.file.path);
    const result = await processImage(buffer, req.file.originalname);

    // 删除原始上传文件（节省空间）
    fs.unlinkSync(req.file.path);

    const { folder_id } = req.body;
    const folderIdValue = folder_id === '' || folder_id === undefined ? null : parseInt(folder_id);

    await pool.query(
      'INSERT INTO media_items (filename, url, type, size, folder_id) VALUES (?, ?, ?, ?, ?)',
      [path.basename(result.original), result.original, 'image', req.file.size, folderIdValue]
    );

    res.json({
      url: result.original,
      thumbnail: result.thumbnail,
      medium: result.medium,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: '上传失败' });
  }
});

// 上传视频（生成缩略图）
router.post('/video', uploadVideo.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择视频文件' });
    }

    const url = `/uploads/videos/${req.file.filename}`;
    const { folder_id } = req.body;
    const folderIdValue = folder_id === '' || folder_id === undefined ? null : parseInt(folder_id);

    // 生成视频缩略图
    const thumbName = `thumb_${Date.now()}_${req.file.filename}.jpg`;
    const thumbPath = path.join(videoDir, thumbName);
    const thumbUrl = `/uploads/videos/${thumbName}`;

    await new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      exec(
        `ffmpeg -i "${req.file.path}" -ss 00:00:01 -vframes 1 -vf "scale=400:-1" -y "${thumbPath}"`,
        (err) => err ? reject(err) : resolve()
      );
    });

    await pool.query(
      'INSERT INTO media_items (filename, url, type, size, folder_id) VALUES (?, ?, ?, ?, ?)',
      [req.file.filename, url, 'video', req.file.size, folderIdValue]
    );

    res.json({ url, thumbnail: thumbUrl, filename: req.file.filename, size: req.file.size });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ message: '上传失败' });
  }
});

// 错误处理中间件
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: '文件大小超出限制' });
  }
  if (err.message.includes('格式')) {
    return res.status(400).json({ message: err.message });
  }
  console.error('Upload error:', err);
  res.status(500).json({ message: '上传失败' });
});

module.exports = router;
