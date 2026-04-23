const bcrypt = require('bcryptjs');
const pool = require('../db');
const { generateToken } = require('../middleware/auth');

// 登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '请输入用户名和密码' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const user = users[0];

    if (user.status === '禁用') {
      return res.status(403).json({ message: '账号已被禁用' });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = generateToken({ id: user.id, username: user.username, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 注册
exports.register = async (req, res) => {
  try {
    const { username, password, phone, name } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '请填写必填项' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, name || username, phone || '', 'user']
    );

    const token = generateToken({ id: result.insertId, username, role: 'user' });

    res.json({
      token,
      user: { id: result.insertId, username, name: name || username, phone: phone || '' }
    });
  } catch (error) {
    console.error('register error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取用户信息
exports.getProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, name, phone, avatar, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新用户信息
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    await pool.query(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), avatar = COALESCE(?, avatar) WHERE id = ?',
      [name, phone, avatar, req.user.id]
    );

    const [users] = await pool.query(
      'SELECT id, username, name, phone, avatar, role FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json(users[0]);
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取收藏列表
exports.getFavorites = async (req, res) => {
  try {
    const [list] = await pool.query(
      `SELECT f.id, f.created_at, c.id as content_id, c.title, c.category, c.author, c.cover, c.views
       FROM favorites f
       JOIN contents c ON f.content_id = c.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    res.json({ list });
  } catch (error) {
    console.error('getFavorites error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 添加收藏
exports.addFavorite = async (req, res) => {
  try {
    const { contentId } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND content_id = ?',
      [req.user.id, contentId]
    );

    if (existing.length > 0) {
      return res.json({ success: true, message: '已收藏' });
    }

    const [result] = await pool.query(
      'INSERT INTO favorites (user_id, content_id) VALUES (?, ?)',
      [req.user.id, contentId]
    );

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('addFavorite error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 删除收藏
exports.deleteFavorite = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM favorites WHERE user_id = ? AND content_id = ?',
      [req.user.id, req.params.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('deleteFavorite error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取预约记录
exports.getAppointments = async (req, res) => {
  try {
    const [list] = await pool.query(
      'SELECT * FROM appointments WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({ list });
  } catch (error) {
    console.error('getAppointments error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 创建预约
exports.createAppointment = async (req, res) => {
  try {
    const { type, title, date, phone } = req.body;

    if (!type || !title || !date) {
      return res.status(400).json({ message: '请填写必填项' });
    }

    const [result] = await pool.query(
      'INSERT INTO appointments (user_id, type, title, date, phone) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, type, title, date, phone || '']
    );

    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [result.insertId]);

    res.json(rows[0]);
  } catch (error) {
    console.error('createAppointment error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 提交意见反馈
exports.submitFeedback = async (req, res) => {
  try {
    const { type, content } = req.body;

    if (!content) {
      return res.status(400).json({ message: '请填写反馈内容' });
    }

    const [result] = await pool.query(
      'INSERT INTO feedbacks (user_id, type, content) VALUES (?, ?, ?)',
      [req.user.id, type || '其他', content]
    );

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('submitFeedback error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
