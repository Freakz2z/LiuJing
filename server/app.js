const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 海南GeoJSON代理（解决跨域问题）
app.get('/api/geo/hainan', async (_req, res) => {
  try {
    const https = require('https');
    const url = 'https://geo.datav.aliyun.com/areas_v3/bound/460000_full.json';
    https.get(url, (geoRes) => {
      let data = '';
      geoRes.on('data', chunk => data += chunk);
      geoRes.on('end', () => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Content-Type', 'application/json');
        res.send(data);
      });
    }).on('error', () => res.status(500).send('Failed to fetch GeoJSON'));
  } catch {
    res.status(500).send('Proxy error');
  }
});

// 确保所有响应使用UTF-8编码
app.use((_req, res, next) => {
  res.charset = 'utf-8';
  next();
});

// 静态文件服务 - 上传的文件
app.use('/uploads', (_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => { res.setHeader('Access-Control-Allow-Origin', '*'); },
  fallthrough: false
}));

// 路由
const publicRoutes = require('./routes/public');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');

app.use('/api/public', publicRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器错误' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});