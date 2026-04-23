# 榴镜 Web 应用

## 快速启动

### Mac/Linux
```bash
cd /Users/freakk/WorkSpace/Project/LiuJing/web
./start.sh
```

### Windows
```batch
cd C:\Users\...\LiuJing\web
start.bat
```

### 单独启动
```bash
# 后端 (端口 3000)
cd server && npm start

# 用户端 (端口 5173)
cd client && npm run dev

# 管理后台 (端口 5174)
cd admin && npm run dev
```

### 停止服务
```bash
# Mac/Linux
./stop.sh

# Windows
stop.bat
```

---

## 访问地址

| 服务 | 地址 |
|------|------|
| 用户端 | http://localhost:5173 |
| 管理后台 | http://localhost:5174 |
| 后端 API | http://localhost:3000 |

---

## 管理员账号
- 用户名：`admin`
- 密码：`CHANGE_ME`

---

## 项目结构

```
web/
├── client/          # 用户端 React (Vite)
├── admin/           # 管理后台 React (Ant Design)
├── server/          # Node.js + Express 后端
├── start.sh         # 启动脚本 (Mac/Linux)
├── stop.sh          # 停止脚本 (Mac/Linux)
├── start.bat        # 启动脚本 (Windows)
└── stop.bat         # 停止脚本 (Windows)
```

---

## API 文档

基础 URL: `http://localhost:3000/api`

### 公开接口
- `GET /public/home` - 首页数据
- `GET /public/contents` - 内容库列表
- `GET /public/policies` - 政策列表
- `GET /public/products` - 文创产品
- `GET /public/bases` - 基地列表

### 用户接口 (需登录)
- `POST /user/login` - 登录
- `POST /user/register` - 注册
- `GET /user/profile` - 获取用户信息
- `GET /user/favorites` - 收藏列表
- `GET /user/appointments` - 预约记录

### 管理员接口 (需管理员权限)
- `GET /admin/stats` - 统计概览
- `GET/POST/PUT/DELETE /admin/contents` - 内容管理
- `GET/POST/PUT/DELETE /admin/bases` - 基地管理
- `GET/POST/PUT/DELETE /admin/products` - 文创管理
- `GET/PUT /admin/appointments` - 预约管理
- `GET/POST/PUT/DELETE /admin/policies` - 政策管理
- `GET/PUT /admin/feedbacks` - 反馈管理