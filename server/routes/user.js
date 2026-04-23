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

module.exports = router;