/**
 * 修复contents表body和images字段中的旧图片URL
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const IMG_DIR = path.join(__dirname, '../uploads/images');

async function main() {
  const pool = await mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Hrk20050321003x!',
    database: 'liujing'
  });

  // 扫描所有webp文件，建立映射
  const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.webp'));
  const urlMap = {}; // key: 原始名(无扩展名), value: /uploads/images/xxx_orig.webp

  for (const f of files) {
    const match = f.match(/^(.+)_(\d+)_(orig|t|m)\.webp$/);
    if (match && match[3] === 'orig') {
      urlMap[match[1]] = `/uploads/images/${f}`;
    }
  }

  // 查找所有需要修复的 contents 记录
  const [rows] = await pool.query(
    "SELECT id, title, body, images FROM contents WHERE (body LIKE '%.png%' OR body LIKE '%.jpg%' OR body LIKE '%.jpeg%') AND body IS NOT NULL"
  );

  let updated = 0;
  for (const row of rows) {
    let newBody = row.body;
    let changed = false;

    // 替换 body 中的旧 URL
    // 匹配 /uploads/images/文件名.png 或 .jpg 等
    const matches = newBody.match(/\/uploads\/images\/[^)\]\s]+\.(png|jpg|jpeg)/g) || [];
    for (const oldUrl of matches) {
      const urlPath = oldUrl.replace('/uploads/images/', '');
      const origName = path.parse(urlPath).name;
      const newUrl = urlMap[origName];
      if (newUrl) {
        newBody = newBody.replace(oldUrl, newUrl);
        changed = true;
      }
    }

    // 修复 images JSON 字段
    let newImages = row.images;
    let imagesChanged = false;
    if (row.images) {
      try {
        const imgs = JSON.parse(row.images);
        const newImgs = imgs.map(oldUrl => {
          const urlPath = oldUrl.replace('/uploads/images/', '');
          const origName = path.parse(urlPath).name;
          return urlMap[origName] || oldUrl;
        });
        newImages = JSON.stringify(newImgs);
        imagesChanged = newImages !== row.images;
      } catch {}
    }

    if (changed) {
      await pool.query('UPDATE contents SET body=? WHERE id=?', [newBody, row.id]);
      updated++;
      console.log(`Fixed body: ${row.title} (id=${row.id})`);
    }
    if (imagesChanged) {
      await pool.query('UPDATE contents SET images=? WHERE id=?', [newImages, row.id]);
      console.log(`Fixed images: ${row.title} (id=${row.id})`);
    }
  }

  console.log(`Total contents updated: ${updated}`);
  await pool.end();
}

main().catch(console.error);
