/**
 * 修复图片压缩后的数据库URL
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const IMG_DIR = path.join(__dirname, '../uploads/images');

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Hrk20050321003x!',
    database: 'liujing'
  });

  // 获取所有webp文件
  const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.webp'));

  // 按原始名分组（取_orig文件作为主URL）
  const urlMap = {};
  for (const f of files) {
    // 文件名格式: {原始名}_{timestamp}_{size}.webp
    // size: t(缩略图), m(中等), orig(原图)
    const parts = f.match(/^(.+)_(\d+)_(orig|t|m)\.webp$/);
    if (!parts) continue;
    const origName = parts[1]; // 原始文件名（无扩展名）
    const size = parts[3];

    if (size === 'orig') {
      // 主URL用original
      urlMap[origName] = `/uploads/images/${f}`;
    }
  }

  // 获取所有图片记录
  const [rows] = await pool.query("SELECT id, filename, url FROM media_items WHERE type='image'");
  console.log(`数据库记录: ${rows.length}`);

  // 更新URL
  let updated = 0;
  let notFound = 0;
  for (const row of rows) {
    const origName = path.parse(row.filename).name;
    const newUrl = urlMap[origName];

    if (newUrl) {
      // 找到对应文件，更新URL
      await pool.query("UPDATE media_items SET url=? WHERE id=?", [newUrl, row.id]);
      updated++;
    } else {
      // 文件不存在，标记（可能原图被删了但有缩略图）
      console.log(`  [未找到] ${row.filename}`);
      notFound++;
    }
  }

  console.log(`更新: ${updated} 条, 未找到: ${notFound} 条`);
  await pool.end();
}

main().catch(console.error);
