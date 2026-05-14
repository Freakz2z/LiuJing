const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { clearPublicCache } = require('../utils/redis');

// 所有管理员接口都需要登录和权限验证
router.use(verifyToken, verifyAdmin);

// 管理员写操作后清空公开缓存
router.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    res.on('finish', () => { if (res.statusCode < 400) clearPublicCache(); });
  }
  next();
});

// 统计概览
router.get('/stats', adminController.getStats);

// 内容管理
router.get('/contents', adminController.getContents);
router.post('/contents', adminController.createContent);
router.put('/contents/:id', adminController.updateContent);
router.delete('/contents/:id', adminController.deleteContent);

// 用户管理
router.get('/users', adminController.getUsers);

// 基地管理
router.get('/bases', adminController.getBases);
router.post('/bases', adminController.createBase);
router.put('/bases/:id', adminController.updateBase);
router.delete('/bases/:id', adminController.deleteBase);

// 文创管理
router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// 预约管理
router.get('/appointments', adminController.getAppointments);
router.put('/appointments/:id/status', adminController.updateAppointmentStatus);

// 订单管理
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderDetail);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// 政策管理
router.get('/policies', adminController.getPolicies);
router.get('/policies/:id', adminController.getPolicyById);
router.post('/policies', adminController.createPolicy);
router.put('/policies/:id', adminController.updatePolicy);
router.delete('/policies/:id', adminController.deletePolicy);

// 媒体库管理
router.get('/media', adminController.getMedia);
router.delete('/media', adminController.deleteMedia);
router.post('/media/rename', adminController.renameMedia);
router.put('/media/:id/move', adminController.moveMedia);

// 媒体文件夹管理
router.get('/media/folders', adminController.getMediaFolders);
router.post('/media/folders', adminController.createMediaFolder);
router.put('/media/folders/:id', adminController.updateMediaFolder);
router.delete('/media/folders/:id', adminController.deleteMediaFolder);

// 轮播图管理
router.get('/banners', adminController.getBanners);
router.post('/banners', adminController.createBanner);
router.put('/banners/:id', adminController.updateBanner);
router.delete('/banners/:id', adminController.deleteBanner);

// 地区管理
router.get('/regions', adminController.getRegions);
router.post('/regions', adminController.createRegion);
router.put('/regions/:id', adminController.updateRegion);
router.delete('/regions/:id', adminController.deleteRegion);

// 产业项目管理
router.get('/industry', adminController.getIndustryItems);
router.post('/industry', adminController.createIndustryItem);
router.put('/industry/:id', adminController.updateIndustryItem);
router.delete('/industry/:id', adminController.deleteIndustryItem);

module.exports = router;
