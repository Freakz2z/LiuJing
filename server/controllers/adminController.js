const pool = require('../db');
const path = require('path');
const fs = require('fs');
const { clearPublicCache } = require('../utils/redis');

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

// ========== 媒体库管理 ==========

// 获取媒体列表（支持按文件夹筛选）
exports.getMedia = async (req, res) => {
  try {
    const { folder_id, type, page, pageSize } = req.query;
    let sql = 'SELECT * FROM media_items WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM media_items WHERE 1=1';
    const params = [];
    const countParams = [];

    if (folder_id !== undefined && folder_id !== null && folder_id !== '') {
      if (folder_id !== 'all' && folder_id !== 'none') {
        sql += ' AND folder_id = ?';
        countSql += ' AND folder_id = ?';
        params.push(parseInt(folder_id));
        countParams.push(parseInt(folder_id));
      } else if (folder_id === 'none') {
        sql += ' AND folder_id IS NULL';
        countSql += ' AND folder_id IS NULL';
      }
    }

    if (type) {
      sql += ' AND type = ?';
      countSql += ' AND type = ?';
      params.push(type);
      countParams.push(type);
    }

    // Get total count
    const [countRows] = await pool.query(countSql, countParams);
    const total = countRows[0].total;

    // Pagination
    const pageNum = parseInt(page) || 1;
    const size = parseInt(pageSize) || 20;
    const offset = (pageNum - 1) * size;
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(size, offset);

    const [rows] = await pool.query(sql, params);
    const list = rows.map(item => ({
      id: item.id,
      filename: item.filename,
      url: item.url,
      type: item.type,
      size: item.size,
      sizeFormatted: formatFileSize(item.size),
      folder_id: item.folder_id,
      createdAt: item.created_at,
    }));

    res.json({ list, total, page: pageNum, pageSize: size, totalPages: Math.ceil(total / size) });
  } catch (error) {
    console.error('getMedia error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 删除媒体（同时删除文件）
exports.deleteMedia = async (req, res) => {
  try {
    const { url, id } = req.body;
    let targetUrl = url;

    if (id) {
      const [rows] = await pool.query('SELECT url FROM media_items WHERE id = ?', [id]);
      if (rows.length > 0) {
        targetUrl = rows[0].url;
      }
    }

    if (!targetUrl) {
      return res.status(400).json({ message: '缺少文件路径' });
    }

    const filename = path.basename(targetUrl);
    const uploadDir = path.join(__dirname, '../uploads');
    const filepath = path.join(uploadDir, 'images', filename);
    let deleted = false;

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      deleted = true;
    } else {
      const videoPath = path.join(uploadDir, 'videos', filename);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
        deleted = true;
      }
    }

    if (id) {
      await pool.query('DELETE FROM media_items WHERE id = ?', [id]);
    } else if (targetUrl) {
      await pool.query('DELETE FROM media_items WHERE url = ?', [targetUrl]);
    }

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('deleteMedia error:', error);
    res.status(500).json({ message: '删除失败' });
  }
};

// 重命名媒体
exports.renameMedia = async (req, res) => {
  try {
    const { oldUrl, newFilename, id } = req.body;
    if (!newFilename) {
      return res.status(400).json({ message: '缺少新文件名' });
    }

    let targetUrl = oldUrl;
    if (id) {
      const [rows] = await pool.query('SELECT url FROM media_items WHERE id = ?', [id]);
      if (rows.length > 0) targetUrl = rows[0].url;
    }

    if (!targetUrl) {
      return res.status(400).json({ message: '缺少文件路径' });
    }

    const oldFilename = path.basename(targetUrl);
    const uploadDir = path.join(__dirname, '../uploads');
    let oldPath = path.join(uploadDir, 'images', oldFilename);
    let newPath = path.join(uploadDir, 'images', newFilename);

    if (!fs.existsSync(oldPath)) {
      oldPath = path.join(uploadDir, 'videos', oldFilename);
      newPath = path.join(uploadDir, 'videos', newFilename);
    }

    if (!fs.existsSync(oldPath)) {
      return res.status(404).json({ message: '文件不存在' });
    }

    if (fs.existsSync(newPath) && oldPath !== newPath) {
      return res.status(400).json({ message: '文件名已存在' });
    }

    fs.renameSync(oldPath, newPath);
    const newUrl = targetUrl.replace(oldFilename, newFilename);

    await pool.query('UPDATE media_items SET filename = ?, url = ? WHERE url = ?', [newFilename, newUrl, targetUrl]);
    res.json({ success: true, newUrl, filename: newFilename });
  } catch (error) {
    console.error('renameMedia error:', error);
    res.status(500).json({ message: '重命名失败' });
  }
};

// 移动媒体到文件夹
exports.moveMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { folder_id } = req.body;

    const [rows] = await pool.query('SELECT * FROM media_items WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: '文件不存在' });
    }

    const folderIdValue = folder_id === null || folder_id === '' || folder_id === 'none' ? null : parseInt(folder_id);

    await pool.query('UPDATE media_items SET folder_id = ? WHERE id = ?', [folderIdValue, id]);
    res.json({ success: true });
  } catch (error) {
    console.error('moveMedia error:', error);
    res.status(500).json({ message: '移动失败' });
  }
};

// ========== 媒体文件夹管理 ==========

// 获取文件夹列表
exports.getMediaFolders = async (req, res) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT * FROM media_folders';
    const params = [];
    if (type) {
      sql += ' WHERE type = ?';
      params.push(type);
    }
    sql += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json({ list: rows });
  } catch (error) {
    console.error('getMediaFolders error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 创建文件夹
exports.createMediaFolder = async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name) {
      return res.status(400).json({ message: '请输入文件夹名称' });
    }

    const [result] = await pool.query(
      'INSERT INTO media_folders (name, type) VALUES (?, ?)',
      [name.trim(), type || 'image']
    );
    const [rows] = await pool.query('SELECT * FROM media_folders WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (error) {
    console.error('createMediaFolder error:', error);
    res.status(500).json({ message: '创建失败' });
  }
};

// 更新文件夹（重命名）
exports.updateMediaFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: '缺少名称' });
    }

    await pool.query('UPDATE media_folders SET name = ? WHERE id = ?', [name.trim(), id]);
    const [rows] = await pool.query('SELECT * FROM media_folders WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: '文件夹不存在' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('updateMediaFolder error:', error);
    res.status(500).json({ message: '更新失败' });
  }
};

// 删除文件夹（文件移回根目录，即 folder_id = NULL）
exports.deleteMediaFolder = async (req, res) => {
  try {
    const { id } = req.params;

    // 文件夹中的文件移回根目录
    await pool.query('UPDATE media_items SET folder_id = NULL WHERE folder_id = ?', [id]);
    // 删除文件夹
    await pool.query('DELETE FROM media_folders WHERE id = ?', [id]);
    res.json({ success: true, message: '删除成功，文件已移至根目录' });
  } catch (error) {
    console.error('deleteMediaFolder error:', error);
    res.status(500).json({ message: '删除失败' });
  }
};

// ========== 其他管理模块（保持原有代码） ==========

// 统计概览
exports.getStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users WHERE role = ?', ['user']);
    const [[{ totalContents }]] = await pool.query('SELECT COUNT(*) as totalContents FROM contents');
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) as totalProducts FROM products');
    const [[{ totalAppointments }]] = await pool.query('SELECT COUNT(*) as totalAppointments FROM appointments');
    const [[{ pendingAppointments }]] = await pool.query('SELECT COUNT(*) as pendingAppointments FROM appointments WHERE status = ?', ['待消费']);
    const [[{ totalViews }]] = await pool.query('SELECT SUM(views) as totalViews FROM contents');
    const [[{ totalBases }]] = await pool.query('SELECT COUNT(*) as totalBases FROM bases');
    const [[{ totalPolicies }]] = await pool.query('SELECT COUNT(*) as totalPolicies FROM policies');

    const [appointmentStatus] = await pool.query(
      'SELECT status, COUNT(*) as count FROM appointments GROUP BY status'
    );
    const appointmentStats = {
      pending: pendingAppointments || 0,
      completed: 0,
      cancelled: 0
    };
    appointmentStatus.forEach(item => {
      if (item.status === '已完成') appointmentStats.completed = item.count;
      if (item.status === '已取消') appointmentStats.cancelled = item.count;
    });

    const [recentViews] = await pool.query(
      'SELECT DATE(created_at) as date, SUM(views) as views FROM contents GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 7'
    );

    const [categoryStats] = await pool.query(
      'SELECT category, COUNT(*) as count FROM contents GROUP BY category'
    );

    const [contentsWithStatus] = await pool.query(
      'SELECT id, title, status FROM contents'
    );

    res.json({
      totalUsers: totalUsers || 0,
      totalContents: totalContents || 0,
      totalProducts: totalProducts || 0,
      totalAppointments: totalAppointments || 0,
      totalBases: totalBases || 0,
      totalPolicies: totalPolicies || 0,
      pendingAppointments: pendingAppointments || 0,
      totalViews: totalViews || 0,
      appointmentStats,
      categoryStats: categoryStats || [],
      contents: contentsWithStatus || [],
      recentViews: recentViews || []
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 轮播图管理
exports.getBanners = async (req, res) => {
  try {
    const [list] = await pool.query('SELECT * FROM banners ORDER BY sort DESC, created_at DESC');
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM banners');
    res.json({ list, total });
  } catch (error) {
    console.error('getBanners error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const { title, subtitle, image, tag, link, sort, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO banners (title, subtitle, image, tag, link, sort, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, subtitle || '', image, tag || '', link || '', sort || 0, status || '显示']
    );
    const [rows] = await pool.query('SELECT * FROM banners WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (error) {
    console.error('createBanner error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, image, tag, link, sort, status } = req.body;

    await pool.query(
      'UPDATE banners SET title = COALESCE(?, title), subtitle = COALESCE(?, subtitle), image = COALESCE(?, image), tag = COALESCE(?, tag), link = COALESCE(?, link), sort = COALESCE(?, sort), status = COALESCE(?, status) WHERE id = ?',
      [title, subtitle, image, tag, link, sort, status, id]
    );

    const [rows] = await pool.query('SELECT * FROM banners WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('updateBanner error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    await pool.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('deleteBanner error:', error);
    res.status(500).json({ message: '删除失败' });
  }
};

// 内容管理
exports.getContents = async (req, res) => {
  try {
    const [list] = await pool.query(
      'SELECT id, title, category, author, cover, video_url, body, duration, views, likes, status, featured, created_at FROM contents ORDER BY created_at DESC'
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM contents');
    res.json({ list, total });
  } catch (error) {
    console.error('getContents error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.createContent = async (req, res) => {
  try {
    const { title, category, author, cover, video_url, body, images, duration, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO contents (title, category, author, cover, video_url, body, images, duration, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, category, author, cover || '', video_url || '', body || '', images || '', duration || '', status || '草稿']
    );
    const [rows] = await pool.query('SELECT * FROM contents WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (error) {
    console.error('createContent error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, author, cover, video_url, body, duration, status, featured } = req.body;

    await pool.query(
      'UPDATE contents SET title = COALESCE(?, title), category = COALESCE(?, category), author = COALESCE(?, author), cover = COALESCE(?, cover), video_url = COALESCE(?, video_url), body = COALESCE(?, body), duration = COALESCE(?, duration), status = COALESCE(?, status), featured = COALESCE(?, featured) WHERE id = ?',
      [title, category, author, cover, video_url, body, duration, status, featured, id]
    );

    const [rows] = await pool.query('SELECT * FROM contents WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('updateContent error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    await pool.query('DELETE FROM contents WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('deleteContent error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 用户管理
exports.getUsers = async (req, res) => {
  try {
    const [list] = await pool.query(
      'SELECT id, username, name, phone, avatar, status, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
      ['user']
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM users WHERE role = ?', ['user']);
    res.json({ list, total });
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 基地管理
exports.getBases = async (req, res) => {
  try {
    const [list] = await pool.query('SELECT * FROM bases ORDER BY created_at DESC');
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM bases');
    res.json({ list, total });
  } catch (error) {
    console.error('getBases error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.createBase = async (req, res) => {
  try {
    const { name, location, features, description, image } = req.body;
    const [result] = await pool.query(
      'INSERT INTO bases (name, location, features, description, image) VALUES (?, ?, ?, ?, ?)',
      [name, location, features || '', description || '', image || '']
    );
    const [rows] = await pool.query('SELECT * FROM bases WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (error) {
    console.error('createBase error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.updateBase = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, features, description, image, status } = req.body;

    await pool.query(
      'UPDATE bases SET name = COALESCE(?, name), location = COALESCE(?, location), features = COALESCE(?, features), description = COALESCE(?, description), image = COALESCE(?, image), status = COALESCE(?, status) WHERE id = ?',
      [name, location, features, description, image, status, id]
    );

    const [rows] = await pool.query('SELECT * FROM bases WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('updateBase error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.deleteBase = async (req, res) => {
  try {
    await pool.query('DELETE FROM bases WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('deleteBase error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 文创管理
exports.getProducts = async (req, res) => {
  try {
    const [list] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM products');
    res.json({ list, total });
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, type, price, stock, image, code } = req.body;
    const [result] = await pool.query(
      'INSERT INTO products (name, description, type, price, stock, image, code) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description || '', type || '文创产品', price, stock || 0, image || '', code || '']
    );
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (error) {
    console.error('createProduct error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, price, stock, image, code, status } = req.body;

    await pool.query(
      'UPDATE products SET name = COALESCE(?, name), description = COALESCE(?, description), type = COALESCE(?, type), price = COALESCE(?, price), stock = COALESCE(?, stock), image = COALESCE(?, image), code = COALESCE(?, code), status = COALESCE(?, status) WHERE id = ?',
      [name, description, type, price, stock, image, code, status, id]
    );

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('updateProduct error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('deleteProduct error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 预约管理
exports.getAppointments = async (req, res) => {
  try {
    const [list] = await pool.query(
      'SELECT a.*, u.name as user_name, u.username FROM appointments a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC'
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM appointments');
    res.json({ list, total });
  } catch (error) {
    console.error('getAppointments error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);

    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('updateAppointmentStatus error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 政策管理
exports.getPolicies = async (req, res) => {
  try {
    const [list] = await pool.query('SELECT * FROM policies ORDER BY created_at DESC');
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM policies');
    res.json({ list, total });
  } catch (error) {
    console.error('getPolicies error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getPolicyById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM policies WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: '政策不存在' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('getPolicyById error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.createPolicy = async (req, res) => {
  try {
    const { title, cover, type, source, content, interpretation, status, published_at } = req.body;
    const [result] = await pool.query(
      'INSERT INTO policies (title, cover, type, source, content, interpretation, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, cover || '', type, source || '', content || '', interpretation || '', status || '草稿', published_at]
    );
    const [rows] = await pool.query('SELECT * FROM policies WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (error) {
    console.error('createPolicy error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, source, content, interpretation, status, published_at } = req.body;

    await pool.query(
      'UPDATE policies SET title = COALESCE(?, title), type = COALESCE(?, type), source = COALESCE(?, source), content = COALESCE(?, content), interpretation = COALESCE(?, interpretation), status = COALESCE(?, status), published_at = COALESCE(?, published_at) WHERE id = ?',
      [title, type, source, content, interpretation, status, published_at, id]
    );

    const [rows] = await pool.query('SELECT * FROM policies WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('updatePolicy error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    await pool.query('DELETE FROM policies WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('deletePolicy error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 地区管理
exports.getRegions = async (req, res) => {
  try {
    const [list] = await pool.query('SELECT * FROM regions ORDER BY id');
    res.json({ list });
  } catch (error) {
    console.error('getRegions error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.createRegion = async (req, res) => {
  try {
    const { name, geo_id, intro, overview } = req.body;
    const [result] = await pool.query(
      'INSERT INTO regions (name, geo_id, intro, overview) VALUES (?, ?, ?, ?)',
      [name, geo_id, intro, overview]
    );
    const [rows] = await pool.query('SELECT * FROM regions WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (error) {
    console.error('createRegion error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.updateRegion = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, geo_id, intro, overview } = req.body;
    await pool.query(
      'UPDATE regions SET name = COALESCE(?, name), geo_id = COALESCE(?, geo_id), intro = COALESCE(?, intro), overview = COALESCE(?, overview) WHERE id = ?',
      [name, geo_id, intro, overview, id]
    );
    const [rows] = await pool.query('SELECT * FROM regions WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('updateRegion error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.deleteRegion = async (req, res) => {
  try {
    await pool.query('DELETE FROM regions WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('deleteRegion error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 产业项目管理
exports.getIndustryItems = async (req, res) => {
  try {
    const [list] = await pool.query(
      'SELECT i.*, r.name as region_name FROM industry_items i LEFT JOIN regions r ON i.region_id = r.id ORDER BY i.region_id, i.id'
    );
    res.json({ list });
  } catch (error) {
    console.error('getIndustryItems error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.createIndustryItem = async (req, res) => {
  try {
    const { region_id, category, name, position, area, capacity, varieties, brand, features, url, status, published_at } = req.body;
    const [result] = await pool.query(
      'INSERT INTO industry_items (region_id, category, name, position, area, capacity, varieties, brand, features, url, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [region_id, category, name, position, area, capacity, varieties, brand, features, url, status || '草稿', published_at]
    );
    const [rows] = await pool.query('SELECT i.*, r.name as region_name FROM industry_items i LEFT JOIN regions r ON i.region_id = r.id WHERE i.id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (error) {
    console.error('createIndustryItem error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.updateIndustryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { region_id, category, name, position, area, capacity, varieties, brand, features, url, status, published_at } = req.body;
    await pool.query(
      'UPDATE industry_items SET region_id = COALESCE(?, region_id), category = COALESCE(?, category), name = COALESCE(?, name), position = COALESCE(?, position), area = COALESCE(?, area), capacity = COALESCE(?, capacity), varieties = COALESCE(?, varieties), brand = COALESCE(?, brand), features = COALESCE(?, features), url = COALESCE(?, url), status = COALESCE(?, status), published_at = COALESCE(?, published_at) WHERE id = ?',
      [region_id, category, name, position, area, capacity, varieties, brand, features, url, status, published_at, id]
    );
    const [rows] = await pool.query('SELECT i.*, r.name as region_name FROM industry_items i LEFT JOIN regions r ON i.region_id = r.id WHERE i.id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('updateIndustryItem error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.deleteIndustryItem = async (req, res) => {
  try {
    await pool.query('DELETE FROM industry_items WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('deleteIndustryItem error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// ============ 订单管理 ============

exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `SELECT o.*, u.username, u.name as user_name, u.phone as user_phone
               FROM orders o
               LEFT JOIN users u ON o.user_id = u.id
               WHERE 1=1`;
    const params = [];
    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY o.created_at DESC';

    const [list] = await pool.query(sql, params);

    // 统计各状态数量
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM orders');
    const [[{ pending }]] = await pool.query('SELECT COUNT(*) as pending FROM orders WHERE status = ?', ['待支付']);
    const [[{ paid }]] = await pool.query('SELECT COUNT(*) as paid FROM orders WHERE status = ?', ['已支付']);
    const [[{ completed }]] = await pool.query('SELECT COUNT(*) as completed FROM orders WHERE status = ?', ['已完成']);

    res.json({
      list,
      stats: { total: total || 0, pending: pending || 0, paid: paid || 0, completed: completed || 0 }
    });
  } catch (error) {
    console.error('getOrders error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const [orders] = await pool.query(
      `SELECT o.*, u.username, u.name as user_name, u.phone as user_phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: '订单不存在' });
    }

    const [items] = await pool.query(
      `SELECT oi.*, p.stock
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    res.json({ order: orders[0], items });
  } catch (error) {
    console.error('getOrderDetail error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['待支付', '已支付', '已取消', '已退款', '已完成'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: '无效的订单状态' });
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    // 如果是取消或退款，退回库存
    if (status === '已取消' || status === '已退款') {
      const [orderItems] = await pool.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
      for (const item of orderItems) {
        await pool.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
      }
    }

    const [rows] = await pool.query(
      `SELECT o.*, u.username, u.name as user_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
