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

// ============ 购物车 ============

// 获取购物车列表
exports.getCart = async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT c.id, c.quantity, c.created_at,
              p.id as product_id, p.name as product_name, p.price, p.stock, p.image, p.code
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ? AND p.status = 1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    const total = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

    res.json({ list: items, total: total.toFixed(2), count: items.length });
  } catch (error) {
    console.error('getCart error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 添加商品到购物车
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ message: '参数错误' });
    }

    // 检查商品是否存在
    const [products] = await pool.query('SELECT id, stock FROM products WHERE id = ? AND status = 1', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ message: '商品不存在或已下架' });
    }

    if (products[0].stock < quantity) {
      return res.status(400).json({ message: '库存不足' });
    }

    // 检查购物车中是否已存在
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );

    if (existing.length > 0) {
      const newQty = existing[0].quantity + quantity;
      if (newQty > products[0].stock) {
        return res.status(400).json({ message: '库存不足' });
      }
      await pool.query('UPDATE cart SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
    } else {
      await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, productId, quantity]
      );
    }

    // 返回更新后的购物车
    const [items] = await pool.query(
      `SELECT c.id, c.quantity, c.created_at,
              p.id as product_id, p.name as product_name, p.price, p.stock, p.image, p.code
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    const total = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

    res.json({ success: true, list: items, total: total.toFixed(2), count: items.length });
  } catch (error) {
    console.error('addToCart error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新购物车商品数量
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ message: '参数错误' });
    }

    // 检查库存
    const [products] = await pool.query('SELECT stock FROM products WHERE id = ? AND status = 1', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ message: '商品不存在' });
    }
    if (products[0].stock < quantity) {
      return res.status(400).json({ message: '库存不足' });
    }

    await pool.query(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, req.user.id, productId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('updateCartItem error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 从购物车移除商品
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    await pool.query(
      'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('removeFromCart error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 清空购物车
exports.clearCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('clearCart error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// ============ 订单 ============

// 生成订单号
function generateOrderNo() {
  return 'LJ' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// 获取用户订单列表
exports.getOrders = async (req, res) => {
  try {
    const [list] = await pool.query(
      `SELECT id, order_no, total_amount, status, receiver_name, phone, address, remark, created_at
       FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ list });
  } catch (error) {
    console.error('getOrders error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取订单详情
exports.getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await pool.query(
      `SELECT id, order_no, total_amount, status, receiver_name, phone, address, remark, created_at, updated_at
       FROM orders WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: '订单不存在' });
    }

    const [items] = await pool.query(
      `SELECT oi.id, oi.product_id, oi.product_name, oi.product_image, oi.price, oi.quantity,
              p.stock
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

// 创建订单（从购物车）
exports.createOrder = async (req, res) => {
  try {
    const { receiver_name, phone, address, remark } = req.body;

    if (!receiver_name || !phone || !address) {
      return res.status(400).json({ message: '请填写收货信息' });
    }

    // 获取购物车商品
    const [cartItems] = await pool.query(
      `SELECT c.product_id, c.quantity, p.name as product_name, p.price, p.image as product_image, p.stock
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ? AND p.status = 1`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ message: '购物车为空' });
    }

    // 检查库存
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ message: `商品【${item.product_name}】库存不足，当前库存${item.stock}` });
      }
    }

    // 计算总价
    const total_amount = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0).toFixed(2);

    // 创建订单
    const order_no = generateOrderNo();
    const [result] = await pool.query(
      `INSERT INTO orders (user_id, order_no, total_amount, status, receiver_name, phone, address, remark)
       VALUES (?, ?, ?, '待支付', ?, ?, ?, ?)`,
      [req.user.id, order_no, total_amount, receiver_name, phone, address, remark || '']
    );

    const orderId = result.insertId;

    // 创建订单商品记录
    for (const item of cartItems) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.product_image, item.price, item.quantity]
      );
      // 扣减库存
      await pool.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // 清空购物车
    await pool.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    res.json({ success: true, order: orders[0], items });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 取消订单
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await pool.query(
      'SELECT status FROM orders WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: '订单不存在' });
    }

    if (orders[0].status !== '待支付') {
      return res.status(400).json({ message: '只有待支付状态的订单可以取消' });
    }

    // 恢复库存
    const [orderItems] = await pool.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
    for (const item of orderItems) {
      await pool.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', ['已取消', id]);

    res.json({ success: true });
  } catch (error) {
    console.error('cancelOrder error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 支付订单（模拟）
exports.payOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await pool.query(
      'SELECT status FROM orders WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: '订单不存在' });
    }

    if (orders[0].status !== '待支付') {
      return res.status(400).json({ message: '订单状态不允许支付' });
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', ['已支付', id]);

    res.json({ success: true, message: '支付成功' });
  } catch (error) {
    console.error('payOrder error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
