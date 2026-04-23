const pool = require('../db');

// 获取首页数据
exports.getHomeData = async (req, res) => {
  try {
    const [banners] = await pool.query(
      'SELECT id, title, subtitle, image, tag, link FROM banners WHERE status = ? ORDER BY sort ASC LIMIT 5',
      ['显示']
    );

    const [todayRecommend] = await pool.query(
      'SELECT id, name, description, price, image, code FROM products WHERE status = 1 ORDER BY sales DESC LIMIT 4'
    );

    const [charity] = await pool.query('SELECT * FROM charity_progress LIMIT 1');

    res.json({
      banners: banners.map(b => ({
        ...b,
        image: b.image || `https://picsum.photos/1200/500?random=${b.id}`
      })),
      policyHighlight: {
        title: '封关政策解读',
        desc: '榴莲跨境贸易"零关税"核心亮点'
      },
      todayRecommend: todayRecommend.map(p => ({
        id: p.id,
        type: '文创',
        title: p.name,
        desc: p.description?.substring(0, 30) || '优质文创产品',
        price: `¥${p.price}`
      })),
      charity: charity[0] || null
    });
  } catch (error) {
    console.error('getHomeData error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取单条内容
exports.getContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM contents WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: '内容不存在' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('getContentById error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取内容库列表
exports.getContents = async (req, res) => {
  try {
    const { category, keyword, page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    let where = 'WHERE status = ?';
    const params = ['已发布'];

    if (category && category !== '全部') {
      where += ' AND category = ?';
      params.push(category);
    }

    if (keyword) {
      where += ' AND (title LIKE ? OR author LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const [list] = await pool.query(
      `SELECT id, title, category, author, cover, video_url, body, images, duration, views, likes, status, featured, created_at
       FROM contents ${where} ORDER BY featured DESC, created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM contents ${where}`,
      params
    );

    res.json({
      list,
      categories: ['全部', '助农短片', '产业纪录片', '产业短剧', '自有IP内容'],
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('getContents error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 增加内容浏览量
exports.incrementContentView = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE contents SET views = views + 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('incrementContentView error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 增加内容点赞数
exports.incrementContentLike = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE contents SET likes = likes + 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('incrementContentLike error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 减少内容点赞数
exports.decrementContentLike = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE contents SET likes = GREATEST(likes - 1, 0) WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('decrementContentLike error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取政策列表
exports.getPolicies = async (req, res) => {
  try {
    const [list] = await pool.query(
      `SELECT id, title, cover, type, source, views, status, published_at, created_at 
       FROM policies WHERE status = ? ORDER BY published_at DESC`,
      ['已发布']
    );

    res.json({ list });
  } catch (error) {
    console.error('getPolicies error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取政策详情
exports.getPolicyById = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('UPDATE policies SET views = views + 1 WHERE id = ?', [id]);

    const [rows] = await pool.query(
      'SELECT * FROM policies WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '政策不存在' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('getPolicyById error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取文创产品列表
exports.getProducts = async (req, res) => {
  try {
    const [list] = await pool.query(
      'SELECT id, name, description, price, stock, sales, image, type, code FROM products WHERE status = 1 ORDER BY sales DESC'
    );

    res.json({ list });
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取基地列表
exports.getBases = async (req, res) => {
  try {
    const [list] = await pool.query(
      'SELECT id, name, location, features, description, image, rating, status FROM bases WHERE status = ? ORDER BY rating DESC',
      ['正常']
    );

    res.json({ list });
  } catch (error) {
    console.error('getBases error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
