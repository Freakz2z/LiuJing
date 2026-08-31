-- 创建数据库
CREATE DATABASE IF NOT EXISTS liujing DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE liujing;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(50) DEFAULT '',
  phone VARCHAR(20) DEFAULT '',
  avatar VARCHAR(255) DEFAULT '',
  role ENUM('user', 'admin') DEFAULT 'user',
  status ENUM('正常', '禁用') DEFAULT '正常',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 首页轮播图表
CREATE TABLE IF NOT EXISTS banners (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  subtitle VARCHAR(200) DEFAULT '',
  image VARCHAR(255) NOT NULL,
  tag VARCHAR(20) DEFAULT '',
  link VARCHAR(255) DEFAULT '',
  sort INT DEFAULT 0,
  status ENUM('显示', '隐藏') DEFAULT '显示',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 内容表
CREATE TABLE IF NOT EXISTS contents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  category ENUM('助农短片', '产业纪录片', '产业短剧', '自有IP内容') NOT NULL,
  author VARCHAR(100) DEFAULT '',
  cover VARCHAR(255) DEFAULT '',
  video_url VARCHAR(255) DEFAULT '',
  duration VARCHAR(20) DEFAULT '',
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  status ENUM('已发布', '草稿') DEFAULT '草稿',
  featured TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  content_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);

-- 基地表
CREATE TABLE IF NOT EXISTS bases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200) NOT NULL,
  features VARCHAR(500) DEFAULT '',
  description TEXT,
  image VARCHAR(255) DEFAULT '',
  rating DECIMAL(2,1) DEFAULT 5.0,
  status ENUM('正常', '停业') DEFAULT '正常',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 文创产品表
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type ENUM('本地榴莲', '进口榴莲', '文创产品') DEFAULT '文创产品',
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  sales INT DEFAULT 0,
  image VARCHAR(255) DEFAULT '',
  code VARCHAR(50) DEFAULT '',
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 预约表
CREATE TABLE IF NOT EXISTS appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('采摘体验', '文创产品', '研学教育') NOT NULL,
  title VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  phone VARCHAR(20) DEFAULT '',
  status ENUM('待消费', '已完成', '已取消') DEFAULT '待消费',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 政策表
CREATE TABLE IF NOT EXISTS policies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  type ENUM('法规', '通知', '办法', '政策') NOT NULL,
  source VARCHAR(100) DEFAULT '',
  content TEXT,
  interpretation TEXT,
  views INT DEFAULT 0,
  status ENUM('已发布', '草稿') DEFAULT '草稿',
  published_at DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 政策留言表
CREATE TABLE IF NOT EXISTS policy_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  policy_id INT NOT NULL,
  user_id INT,
  content TEXT NOT NULL,
  reply TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 反馈表
CREATE TABLE IF NOT EXISTS feedbacks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  type ENUM('功能建议', '内容反馈', '问题咨询', '其他') DEFAULT '其他',
  content TEXT NOT NULL,
  reply TEXT,
  status ENUM('待回复', '已回复') DEFAULT '待回复',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 公益进度表
CREATE TABLE IF NOT EXISTS charity_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  target_amount INT DEFAULT 200000,
  current_amount INT DEFAULT 0,
  farmer_count INT DEFAULT 0,
  infrastructure_count INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入管理员占位账号；首次部署前请将 password 替换为真实 bcrypt hash
INSERT INTO users (username, password, name, role) VALUES
('admin', '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', '管理员', 'admin');

-- 插入公益进度初始数据
INSERT INTO charity_progress (target_amount, current_amount, farmer_count, infrastructure_count) VALUES
(200000, 128560, 2340, 15);

-- 插入示例轮播图
INSERT INTO banners (title, subtitle, image, tag, sort) VALUES
('《榴行海南》纪录片热播中', '探访海南榴莲产业，见证乡村振兴', 'https://picsum.photos/1200/500?random=1', '纪录片', 1),
('自贸港榴莲产业新机遇', '零关税政策解读，跨境贸易新风口', 'https://picsum.photos/1200/500?random=2', '政策热点', 2),
('公益助农进行时', '每购买一份文创产品，助农10元', 'https://picsum.photos/1200/500?random=3', '公益', 3);
