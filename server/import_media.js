
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Hrk20050321003x!',
  database: 'liujing'
});

const uploadDir = path.join(__dirname, '../uploads');

async function importFiles() {
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  
  for (const type of ['images', 'videos']) {
    const dir = path.join(uploadDir, type);
    if (!fs.existsSync(dir)) continue;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.startsWith('.')) continue;
      const ext = path.extname(file).toLowerCase();
      const isImage = imageExts.includes(ext);
      const isVideo = videoExts.includes(ext);
      if (!isImage && !isVideo) continue;
      
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const url = `/uploads/${type}/${file}`;
      
      // Check if already in DB
      const [rows] = await pool.query('SELECT id FROM media_items WHERE url = ?', [url]);
      if (rows.length > 0) {
        console.log('Already exists:', file);
        continue;
      }
      
      await pool.query(
        'INSERT INTO media_items (filename, url, type, size, folder_id) VALUES (?, ?, ?, ?, NULL)',
        [file, url, isImage ? 'image' : 'video', stats.size]
      );
      console.log('Imported:', file, '-', isImage ? 'image' : 'video');
    }
  }
  
  console.log('Done!');
  await pool.end();
}

importFiles().catch(e => { console.error(e); process.exit(1); });
