const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// 登录
router.post('/login', userController.login);

// 注册
router.post('/register', userController.register);

// 以下接口需要登录
router.use(verifyToken);

// 获取用户信息
router.get('/profile', userController.getProfile);

// 更新用户信息
router.put('/profile', userController.updateProfile);

// 获取收藏列表
router.get('/favorites', userController.getFavorites);

// 添加收藏
router.post('/favorites', userController.addFavorite);

// 删除收藏
router.delete('/favorites/:id', userController.deleteFavorite);

// 获取预约记录
router.get('/appointments', userController.getAppointments);

// 创建预约
router.post('/appointments', userController.createAppointment);

// 提交意见反馈
router.post('/feedback', userController.submitFeedback);

// ============ 购物车 ============
router.get('/cart', userController.getCart);
router.post('/cart', userController.addToCart);
router.put('/cart', userController.updateCartItem);
router.delete('/cart/:productId', userController.removeFromCart);
router.delete('/cart', userController.clearCart);

// ============ 订单 ============
router.get('/orders', userController.getOrders);
router.get('/orders/:id', userController.getOrderDetail);
router.post('/orders', userController.createOrder);
router.put('/orders/:id/pay', userController.payOrder);
router.put('/orders/:id/cancel', userController.cancelOrder);

module.exports = router;