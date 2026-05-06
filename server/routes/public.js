const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// 获取首页数据
router.get('/home', publicController.getHomeData);

// 获取单条内容
router.get('/contents/:id', publicController.getContentById);

// 获取内容库列表
router.get('/contents', publicController.getContents);

// 增加内容浏览量
router.post('/contents/:id/view', publicController.incrementContentView);

// 增加内容点赞数
router.post('/contents/:id/like', publicController.incrementContentLike);

// 减少内容点赞数
router.post('/contents/:id/unlike', publicController.decrementContentLike);

// 获取政策列表
router.get('/policies', publicController.getPolicies);

// 获取政策详情
router.get('/policies/:id', publicController.getPolicyById);

// 获取文创产品列表
router.get('/products', publicController.getProducts);

// 获取基地列表
router.get('/bases', publicController.getBases);

// 获取产业地区列表
router.get('/regions', publicController.getRegions);

// 获取产业项目列表
router.get('/industry', publicController.getIndustryItems);

// 获取单个地区及产业详情
router.get('/industry/:regionId', publicController.getIndustryByRegion);

module.exports = router;