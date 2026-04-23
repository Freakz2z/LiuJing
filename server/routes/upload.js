const express = require('express');
const router = express.Router();
const path = require('path');
const { uploadImage, uploadVideo } = require('../middleware/upload');
const pool = require('../db');

// 上传图片
router.post('/image', uploadImage.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择图片文件' });
    }
    const url = `/uploads/images/${req.file.filename}`;
    const { folder_id } = req.body;
    const folderIdValue = folder_id === '' || folder_id === undefined ? null : parseInt(folder_id);

    await pool.query(
      'INSERT INTO media_items (filename, url, type, size, folder_id) VALUES (?, ?, ?, ?, ?)',
      [req.file.filename, url, 'image', req.file.size, folderIdValue]
    );

    res.json({ url, filename: req.file.filename, size: req.file.size });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: '上传失败' });
  }
});

// 上传视频
router.post('/video', uploadVideo.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择视频文件' });
    }
    const url = `/uploads/videos/${req.file.filename}`;
    const { folder_id } = req.body;
    const folderIdValue = folder_id === '' || folder_id === undefined ? null : parseInt(folder_id);

    await pool.query(
      'INSERT INTO media_items (filename, url, type, size, folder_id) VALUES (?, ?, ?, ?, ?)',
      [req.file.filename, url, 'video', req.file.size, folderIdValue]
    );

    res.json({ url, filename: req.file.filename, size: req.file.size });
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
