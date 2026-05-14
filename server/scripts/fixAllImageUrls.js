/**
 * 修复所有表的旧图片URL
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

  // 扫描所有webp文件，按原始名建立映射
  const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.webp'));
  const urlMap = {}; // key: 原始名(无扩展名), value: _orig webp URL

  for (const f of files) {
    const match = f.match(/^(.+)_(\d+)_(orig|t|m)\.webp$/);
    if (match && match[3] === 'orig') {
      urlMap[match[1]] = `/uploads/images/${f}`;
    }
  }

  console.log(`找到 ${Object.keys(urlMap).length} 个原始图片文件`);

  // 遍历所有可能的表和图片字段
  const tables = [
    { name: 'products', idCol: 'id', urlCol: 'image' },
    { name: 'bases', idCol: 'id', urlCol: 'image' },
    { name: 'contents', idCol: 'id', urlCol: 'image' },
    { name: 'policies', idCol: 'id', urlCol: 'cover' },
    { name: 'industry_items', idCol: 'id', urlCol: 'image' },
    { name: 'banners', idCol: 'id', urlCol: 'image' },
  ];

  let totalUpdated = 0;

  for (const tbl of tables) {
    try {
      const [rows] = await pool.query(`SELECT ${tbl.idCol}, ${tbl.urlCol} FROM ${tbl.name} WHERE ${tbl.urlCol} IS NOT NULL`);
      for (const row of rows) {
        const oldUrl = row[tbl.urlCol];
        // 检查是否是旧扩展名
        if (!/\.(png|jpg|jpeg)$/i.test(oldUrl)) continue;

        // 从URL中提取文件名（去扩展名）
        const urlPath = oldUrl.replace('/uploads/images/', '');
        const origName = path.parse(urlPath).name;

        const newUrl = urlMap[origName];
        if (newUrl) {
          await pool.query(`UPDATE ${tbl.name} SET ${tbl.urlCol}=? WHERE ${tbl.idCol}=?`, [newUrl, row[tbl.idCol]]);
          totalUpdated++;
        } else {
          console.log(`  [未匹配] ${tbl.name}: ${origName}`);
        }
      }
    } catch (e) {
      console.log(`[跳过] ${tbl.name}: ${e.message}`);
    }
  }

  console.log(`总共更新: ${totalUpdated} 条记录`);
  await pool.end();
}

main().catch(console.error);
